# Architecture

Vercel-centric. Turborepo monorepo. See [stack.md](stack.md) for the service list.

## High-level

```
┌────────────────────────────────────────────────────────┐
│  Next.js (latest, App Router) on Vercel                │
│  ├── Pages + RSC                                        │
│  ├── Route Handlers (REST + QStash webhooks)            │
│  ├── Server Actions (mutations)                         │
│  └── Vercel Cron (lightweight schedules)                │
└────┬───────────────────────────────────────────────────┘
     │
     ├─→ Neon Postgres        (Vercel integration)
     ├─→ Upstash Redis        (Vercel integration; cache, rate limit, idempotency)
     ├─→ QStash               (Vercel integration; queue + cron)
     ├─→ Vercel Blob          (images, KYC docs)
     ├─→ Privy SDK            (auth + embedded XRPL wallet)
     ├─→ Sumsub               (KYC, hosted WebSDK)
     ├─→ Resend               (transactional email)
     ├─→ Sentry               (error tracking)
     └─→ xrplcluster.com      (public XRPL RPC)
```

No separate backend service. No worker. One Vercel deployment + integrated SaaS.

## Repo (Turborepo + pnpm)

```
surgexrp/
├── apps/
│   └── web/                  # Next.js (latest) app
├── packages/
│   ├── db/                   # Prisma schema + client
│   ├── shared/               # Zod schemas, types, constants
│   ├── xrpl/                 # xrpl.js helpers (build tx, parse, MPT, fees)
│   └── ui/                   # (optional) shared shadcn primitives
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

Build cache + task graph via Turborepo; pnpm workspaces; Biome lint+format; Vitest + Playwright; lefthook pre-commit.

## Settlement layer: XRPL

- **Tokens**: each property = MPT (XLS-33) with `lsfMPTRequireAuth` + `lsfMPTCanTransfer`. Fallback if MPT not on mainnet at build: issued-currency token + `RequireAuth` + trustlines.
- **Currencies**: native XRP and RLUSD.
- **Primary issuance**: issuer signs `Payment` transferring N units to buyer; buyer pays in XRP/RLUSD.
- **Secondary trading**: native XRPL DEX.
  - Market = `OfferCreate` with `tfImmediateOrCancel`
  - Limit = `OfferCreate` with `Expiration`
  - Cancel = `OfferCancel`
  - Book read = `book_offers` against xrplcluster.com
  - Trade history = `account_tx` against issuer account
- **Compliance lever**: `RequireAuth` on issuer + signed `MPTokenAuthorize` after KYC pass.
- **Reserves**: sponsor base 2 XRP + per-object 0.2 XRP at user onboarding.

## XRPL access pattern

No persistent connection from the app. HTTPS RPC to `xrplcluster.com` either on-demand (user action) or driven by QStash schedules (background pollers).

| Need | Pattern |
|---|---|
| Order book snapshot | QStash 3s cron per active property → Route Handler polls `book_offers` → upsert Redis (2s TTL) + Neon. **Client** uses TanStack Query `refetchInterval: 3000` on `/api/properties/:id/book` → reads Redis snapshot. |
| Trade history / chart | Same poller computes deltas + last candle in Redis. Client polls `/api/properties/:id/market` every 3s. |
| User balance + holdings | On-demand: Route Handler calls `account_info` + `account_lines` + `account_objects` → cache per-user in Redis (10s TTL). Client polls every 10s on Portfolio. |
| User open-order fills | Client polls user-orders endpoint on screen mount + every 10s. Diff vs previous fetch → toast notification. |
| Tx submission | Server builds tx → Privy signs → server submits via xrplcluster → returns `tx_hash`. |
| Tx confirmation | Client polls `/api/tx/:hash` every 2s for ~60s. Server reads xrplcluster `tx` RPC on demand, caches by hash 1s in Redis. |

If xrplcluster rate-limits, upgrade to paid XRPL RPC (QuickNode, Tatum) before self-hosting.

## Frontend

- Next.js (latest, App Router) + TypeScript strict.
- Tailwind CSS v4 + shadcn/ui + Radix primitives.
- **tRPC client** (`@trpc/react-query`) for all read queries + polling; integrates with TanStack Query so `refetchInterval` and cache invalidation work uniformly.
- **next-safe-action** `useAction` hook for forms; pairs with React Hook Form + `@hookform/resolvers/zod` + Zod schemas from `packages/shared`.
- TanStack Query `refetchInterval` on trading + portfolio screens (3s book/trades, 10s portfolio).
- Lightweight Charts for trading view; Recharts for portfolio.
- Framer Motion for modals + glassmorphism.

## Backend (== Next.js)

- **tRPC** as the query/RPC layer — single Route Handler at `/api/trpc/[trpc]` mounts `appRouter` from `apps/web/src/server/trpc/root.ts`. Client uses `@trpc/react-query` so calls integrate with TanStack Query (caching, `refetchInterval` for polling endpoints like book/market/tx-status).
- **next-safe-action** for Server Actions invoked from forms (purchase, place order, withdraw, profile, KYC start). Composes `authActionClient` and `kycActionClient` middleware; Zod input schemas from `packages/shared`; typed `{ data | serverError | validationErrors }` envelope on the client via `useAction`.
- **Route Handlers** retained only for inbound webhooks (Sumsub, Privy, QStash) — they need raw request + signature verification.
- **Prisma** over Neon for the data layer (in `packages/db`). Migrations via `prisma migrate dev` locally + `prisma migrate deploy` in CI.
- **Zod** schemas in `packages/shared` — single source for forms, tRPC inputs, Server Action inputs, webhook payloads.
- **xior** on the server for outbound calls to external APIs (xrplcluster, Sumsub REST, Resend, Privy server) where no first-party SDK is preferred. Not used between client ↔ own backend (tRPC + Server Actions own that path).
- TypeScript strict mode everywhere; one `tsconfig.base.json` extended per package.
- All QStash webhook endpoints verify `Upstash-Signature` before processing.

## Auth + Wallet (Privy)

- User clicks **Log in** → Privy modal opens → email → Privy sends OTP → user verifies → Privy provisions XRPL embedded wallet (MPC keyshares; key never reconstructed).
- App receives session JWT + r-address; persists `users.email`, `users.xrp_address`, `users.privy_user_id`.
- Signing: server builds unsigned tx JSON → Privy SDK signs → server submits via xrplcluster.
- Withdraw: same — Privy signs a `Payment` from user's r-address to entered destination.
- Recovery: Privy social + passkey mechanisms.

Fallback: if Privy XRPL adapter is missing at build time, swap to **Web3Auth XRPL adapter**.

## KYC (Sumsub)

- Trigger: first **Buy / Sell / Withdraw** attempt.
- Flow: Route Handler creates a Sumsub applicant + access token → client mounts WebSDK in modal → user completes ID + selfie + address → Sumsub webhooks `/api/kyc/webhook` → verify HMAC → set `users.kyc_status = verified` → backend signs `MPTokenAuthorize` for the user's r-address.
- Re-verify: every 24 months or on transaction >$10k.
- Failed KYC: blocked; manual review queue surfaced in admin route.

## Realtime (client polling)

No realtime SaaS. Clients use TanStack Query `refetchInterval` against Redis-backed Route Handlers.

| Endpoint | Used by | Interval |
|---|---|---|
| `/api/properties/:id/book` | Trading screen | 3s |
| `/api/properties/:id/market` | Trading screen (last trade, deltas) | 3s |
| `/api/properties/:id/candles?range=` | Chart | 5s for last-candle refresh; full pull on range change |
| `/api/portfolio/overview` | Portfolio screen | 10s |
| `/api/orders?status=open` | Portfolio + trading | 10s; diff vs previous → fill toast |
| `/api/tx/:hash` | After any tx submit | 2s for 60s, then stop |

Every screen also has a manual **Refresh** button.

**Scale ceiling**: ~1k concurrent on Vercel Pro (1M invocations/day) before invocation cost forces reintroducing a fan-out service (Pusher / Ably / Supabase Realtime). MVP fits comfortably.

## Yield distribution (auto-drip)

- **Vercel Cron** monthly per property → fires `/api/jobs/yield-drip?propertyId=X&periodId=Y`.
- Handler:
  1. Read holder snapshot from Neon at the period close ledger index.
  2. Compute pro-rata payouts.
  3. Enqueue chunks of ~50 holders to QStash (`/api/jobs/yield-drip-chunk`).
  4. Each chunk submits batched `Payment` txns; writes `(period_id, holder_address) → tx_hash` for idempotency; publishes `user:<userId>` event.
  5. Nightly reconciliation job confirms hashes; alerts on drift via Sentry.
- Auto-Reinvest toggle in Profile/Settings → distribution routed into a queued `OfferCreate` buy for the same property instead of paying out.

## Compliance posture (MVP scope)

- KYC at first transaction via Sumsub — gated.
- Sanctions / PEP / adverse-media — **out of scope**. Withdrawal cap $1k/day pre-KYC, $10k/day post-KYC.
- Wallet-address risk (KYT) — **out of scope**. Manual review of any withdrawal >$10k.
- All gaps documented; client signs off before production launch.

## Background job catalog (QStash)

| Job | Endpoint | Cadence |
|---|---|---|
| `xrpl-poll-book` | `/api/jobs/xrpl-poll-book` | 3s per active property |
| `yield-drip` | `/api/jobs/yield-drip` | Monthly per property (Vercel Cron entry → QStash chunks) |
| `yield-drip-chunk` | `/api/jobs/yield-drip-chunk` | Triggered by yield-drip orchestrator |
| `offer-expiry-sweep` | `/api/jobs/offer-expiry-sweep` | Hourly safety net |
| `reconciliation` | `/api/jobs/reconciliation` | Nightly |

All endpoints verify `Upstash-Signature`. All jobs idempotent via Redis `SETNX` keys per `(job, id)`.

`xrpl-poll-user-tx` and `tx-confirm` retry chain are gone — clients poll directly.

## Storage layout (Vercel Blob)

| Bucket | Purpose | Public? |
|---|---|---|
| `properties/*` | Hero + gallery images | Public |
| `kyc/*` | Sumsub applicant docs (encrypted, short-TTL) | Private, signed URLs |
| `legal/*` | Disclaimer, ToS, agreement PDFs | Public |
| `avatars/*` | User profile pictures | Public via signed URL |

## Hosting topology

- One Vercel project, two environments: `preview` (per-PR) + `production` (main).
- Neon: one project; `main` branch + per-PR branches.
- All other services: one account each, per-env keys via Vercel env vars.

## Remaining open items

- MPT (XLS-33) mainnet readiness at build start; fallback = issued-currency + RequireAuth.
- Confirm Privy XRPL adapter; fallback = Web3Auth XRPL.
- Step-up auth (passkey / biometric) screens not in current Figma — design alongside withdrawal + high-value purchase flows or skip for MVP.
