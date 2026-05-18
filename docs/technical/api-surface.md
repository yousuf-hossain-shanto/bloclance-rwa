# API Surface

Two layers, both type-safe end-to-end:

1. **tRPC** for read queries + cancellable mutations the client polls (orders, market data, portfolio). Mounted at `/api/trpc/[trpc]` via a single Next.js Route Handler. Client uses `@trpc/react-query` so it integrates with TanStack Query (incl. `refetchInterval`).
2. **`next-safe-action`** for Server Actions invoked directly from forms / button clicks (purchase, withdraw, profile updates, KYC start). Validates input with the same Zod schemas; returns typed result; supports auth + KYC middleware.
3. Raw **Route Handlers** for inbound webhooks only (Sumsub, QStash, Privy if needed) — those need raw request access and signature verification, can't be tRPC.

All Zod schemas live in `packages/shared`, imported by both tRPC procedures and `next-safe-action` actions so the validation is single-source.

## tRPC routers (queries + read-mutations)

Layout under `apps/web/src/server/trpc/`:

```
trpc/
├── trpc.ts                # createTRPCRouter, publicProcedure, protectedProcedure, kycProcedure
├── context.ts             # session, userId, kycStatus, prisma
├── routers/
│   ├── auth.ts            # me
│   ├── properties.ts      # list, byId, market, book, candles, trades
│   ├── portfolio.ts       # overview, holdings, valueSeries
│   ├── orders.ts          # list, byId, preview, cancel
│   ├── purchases.ts       # preview, byId
│   ├── withdrawals.ts     # list, byId
│   ├── wallets.ts         # balances, depositAddress
│   └── tx.ts              # status (by hash)
└── root.ts                # appRouter
```

### Procedure inventory

| Router.procedure | Type | Auth | Returns / notes |
|---|---|---|---|
| `auth.me` | query | optional | `{ user, kycStatus } \| null` |
| `properties.list` | query | optional | input `{ sort, page, pageSize, filters }`; returns paginated cards |
| `properties.byId` | query | optional | full detail (description, financials, documents, gallery) |
| `properties.market` | query | optional | last price, volume, valuation, available units, deltas |
| `properties.book` | query | optional | order book snapshot. Client `refetchInterval: 3000`. |
| `properties.candles` | query | optional | input `{ id, interval, range, axis }` |
| `properties.trades` | query | optional | recent trades |
| `portfolio.overview` | query | protected | KPIs incl. value series |
| `portfolio.holdings` | query | protected | paginated holdings |
| `portfolio.valueSeries` | query | protected | range param |
| `orders.list` | query | protected | input `{ status?, propertyId? }` |
| `orders.byId` | query | protected | detail |
| `orders.preview` | query | protected + kyc | input `{ propertyId, side, type, units, pricePerUnit?, asset }`; returns total/fees/slippage |
| `orders.cancel` | mutation | protected + kyc | cancels open order on XRPL |
| `purchases.preview` | query | protected + kyc | input `{ propertyId, units, asset }`; returns total/fees/balance check |
| `purchases.byId` | query | protected | status |
| `withdrawals.list` | query | protected | history |
| `withdrawals.byId` | query | protected | detail + tx hash |
| `wallets.balances` | query | protected | per-asset balances + USD equiv |
| `wallets.depositAddress` | query | protected | r-address |
| `tx.status` | query | protected | input `{ hash }`; client polls every 2s for ~60s |

`protectedProcedure` enforces session. `kycProcedure` enforces `kyc_status = verified` and triggers the Sumsub flow modal if not.

## next-safe-action actions (mutations from UI)

Layout under `apps/web/src/actions/`:

```
actions/
├── safe-action.ts         # createSafeActionClient with auth + kyc middlewares
├── profile.ts             # updateProfile, uploadAvatar
├── kyc.ts                 # startKyc → returns Sumsub access token
├── purchases.ts           # submitPurchase
├── orders.ts              # placeOrder (market/limit, buy/sell)
├── withdrawals.ts         # submitWithdrawal
└── settings.ts            # toggleAutoReinvest
```

Each action:

- Defines its input via a Zod schema from `packages/shared`.
- Composes the right middleware (`authActionClient`, `kycActionClient`).
- Returns `{ data | serverError | validationErrors }` envelope from next-safe-action.
- Called from forms via `useAction(...)` hook.

### Action inventory

| Action | Middleware | Input | Effect |
|---|---|---|---|
| `updateProfile` | auth | `{ displayName? }` | Patch `users` row |
| `uploadAvatar` | auth | `FormData` (multipart) | Upload to Vercel Blob, save URL |
| `startKyc` | auth | — | Create Sumsub applicant, return SDK access token |
| `submitPurchase` | auth + kyc | `{ propertyId, units, asset, agreementAccepted }` | Build + sign + submit primary-issuance Payment. Returns purchase id + tx hash. |
| `placeOrder` | auth + kyc | `{ propertyId, side, type, units, pricePerUnit?, asset }` | Build + sign + submit `OfferCreate`. Returns order id + tx hash. |
| `cancelOrder` | auth + kyc | `{ orderId }` | `OfferCancel` |
| `submitWithdrawal` | auth + kyc | `{ asset, amount, destinationAddress }` | Build + sign + submit `Payment`. Returns withdrawal id + tx hash. |
| `toggleAutoReinvest` | auth | `{ enabled }` | Update user settings |

Notes:
- `placeOrder`, `submitPurchase`, `submitWithdrawal` return the tx hash; the client then uses tRPC `tx.status` with TanStack Query to poll confirmation.
- Signing happens via the Privy SDK on the client; the action receives the signed tx blob and submits via `xrplcluster.com`.

## Webhook Route Handlers (raw HTTP)

| Path | Source | Notes |
|---|---|---|
| `POST /api/webhooks/sumsub` | Sumsub | HMAC signature verify; updates `users.kyc_status`; signs `MPTokenAuthorize` for the user's r-address. |
| `POST /api/webhooks/privy` | Privy (optional) | User lifecycle events. |
| `POST /api/jobs/*` | QStash | `Upstash-Signature` verify; idempotent. See [architecture.md](architecture.md) job catalog. |

## Realtime model

No WebSocket / SSE channels. Clients poll via tRPC + TanStack Query `refetchInterval`. See [stack.md](stack.md) realtime model.

## Conventions

- **Auth**: session cookie issued by Privy login; bridged into tRPC context.
- **Decimals as strings**: avoid JS float loss. Display amount with explicit asset: `{ asset: "XRP", amount: "658.25" }`. Internal calcs use `decimal.js` or `Prisma.Decimal`.
- **Pagination**: tRPC inputs `{ cursor?, limit }` (cursor-based) or `{ page, pageSize }` (offset). Pick cursor for high-churn lists (orders, trades), offset for stable lists (properties).
- **Errors**:
  - tRPC: throw `TRPCError({ code, message })` — client gets typed error.
  - next-safe-action: throw → returns `{ serverError }`. Validation failures auto-surface in `validationErrors`.
  - Webhooks: HTTP 200 on success, 4xx on signature mismatch, 5xx on internal.
