# Tech Stack

Client-MVP profile. Vercel-centric with Vercel marketplace integrations (Neon, Upstash Redis, QStash) + Turborepo monorepo. Realtime via client polling — no realtime SaaS.

## Services

| Layer | Pick | Notes |
|---|---|---|
| **App (FE + BE)** | **Next.js 15** (App Router) on **Vercel** | Route Handlers + Server Actions. One repo. |
| **Database** | **Neon Postgres** (Vercel integration) | Branching for PR previews. |
| **Cache + rate limit** | **Upstash Redis** (Vercel integration) | Hot reads (order book snapshot, recent trades), rate limits, idempotency keys. |
| **Queue + cron** | **QStash** (Upstash, Vercel integration) | XRPL book polling, yield drip, nightly reconciliation. |
| **Realtime** | **Client polling** (TanStack Query `refetchInterval`) | 3s on trading screens, 10s on portfolio. Server reads Redis cache, returns JSON. No realtime SaaS. |
| **Storage** | **Vercel Blob** | Property images, KYC docs. |
| **Auth + Wallet** | **Privy** | Email-OTP login *and* embedded XRPL wallet in one SDK. |
| **KYC** | **Sumsub** | WebSDK at first Buy / Sell / Withdraw. |
| **Transactional email** | **Resend** | Receipts, yield-payout notifications. |
| **Error tracking** | **Sentry** free tier | 5k errors/mo. |
| **Product analytics** | **Vercel Analytics + Speed Insights** | Free hobby. |
| **XRPL client** | **xrpl.js v4** + public **xrplcluster.com** | No self-hosted node. |

## Frontend libs

| Slot | Pick |
|---|---|
| Language | **TypeScript (strict)** |
| ORM | **Prisma** (in `packages/db`) |
| UI primitives | shadcn/ui + Radix |
| Styling | Tailwind CSS v4 |
| Forms | **React Hook Form** + **Zod** via `@hookform/resolvers/zod` |
| Validation shared FE/BE | **Zod** schemas in `packages/shared` |
| Server cache / data | TanStack Query (with `refetchInterval` for live screens) |
| Charts (trading) | Lightweight Charts (TradingView) |
| Charts (portfolio) | Recharts |
| Tables | TanStack Table |
| Animations | Framer Motion |

## Monorepo layout (Turborepo + pnpm workspaces)

```
surgexrp/
├── apps/
│   └── web/                  # Next.js 15 app
├── packages/
│   ├── db/                   # Prisma schema + generated client
│   ├── shared/               # Zod schemas, types, constants used by FE + BE
│   ├── xrpl/                 # xrpl.js helpers (build tx, parse, MPT, fees)
│   └── ui/                   # (optional) shadcn primitives if reused later
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

- **Turborepo** for build caching + task graph (`turbo dev`, `turbo build`, `turbo lint`).
- **pnpm** workspaces — fast install, strict deps.
- **Biome** lint + format (one binary).
- **Vitest** + **Playwright** for tests; **lefthook** for pre-commit.

## Realtime model (client polling)

| Source | How updates reach the client |
|---|---|
| Order book per property | **QStash cron 3s** → Route Handler polls `book_offers` → upsert Redis (2s TTL) + Neon. **Client** uses TanStack Query `refetchInterval: 3000` on `/api/properties/:id/book` while trading screen open — reads Redis snapshot, returns JSON. |
| New trades / chart tick | Same poller computes deltas + last candle. Client `refetchInterval: 3000` on `/api/properties/:id/market`. |
| User balance + holdings | Fetched on screen mount + after every user action (post-buy, post-sell, post-withdraw). `refetchInterval: 10000` on Portfolio. |
| Order fill notifications | Detected when user's open-orders query diffs vs previous fetch; toast on client. |
| Tx confirmation after submit | Client polls `/api/tx/:hash` every 2s for ~60s. Server reads xrplcluster `tx` RPC on demand (cache by hash 1s in Redis). |

**Manual Refresh** button on every screen for power users.

**UX impact**: 3s freshness on trading, 10s on portfolio. No sub-second pushes. Acceptable for RWA retail.

## Background jobs (QStash)

| Job | Endpoint | Schedule |
|---|---|---|
| `xrpl-poll-book` | `/api/jobs/xrpl-poll-book?propertyId=X` | every 3s per active property |
| `yield-drip` | `/api/jobs/yield-drip?propertyId=X&periodId=Y` | monthly per property |
| `yield-drip-chunk` | `/api/jobs/yield-drip-chunk` | triggered by orchestrator, batches of ~50 |
| `reconciliation` | `/api/jobs/reconciliation` | nightly |
| `offer-expiry-sweep` | `/api/jobs/offer-expiry-sweep` | hourly safety net (XRPL auto-cleans via `Expiration`) |

All endpoints verify QStash signature via `Upstash-Signature` header before processing.

**Dropped jobs vs Pusher version**: `xrpl-poll-user-tx` (clients fetch on demand) and `tx-confirm` retry chain (client polls instead). Two fewer QStash jobs.

## Cost estimate

| Stage | Monthly $ |
|---|---|
| Solo dev / closed alpha | $0 (Vercel Hobby + all free tiers + QStash free 500/day) |
| 100 users closed beta | ~$30–80 (Vercel Pro $20 + Sumsub verifies + QStash free still fits) |
| 1k users soft launch | ~$300–600 (Vercel Pro polling traffic + Sumsub scaling + QStash Pro $10 + paid Resend + Sentry team). At ~1k concurrent on Vercel Pro 1M invokes/day = comfortable. |

**Polling cost note**: 100 concurrent on trading screens × 20 polls/min = 2.88M invocations/day → outgrows Hobby (100k/day), fits Pro (1M/day with bursts). At 1k concurrent → 28.8M/day → need to reintroduce a fan-out service (Pusher / Ably / Supabase Realtime) or accept higher poll intervals (5–10s). Re-evaluate at that scale.

## Compliance gaps (documented, not solved)

| Gap | Decision |
|---|---|
| No sanctions / PEP / adverse-media screening | Out of scope for MVP. Withdrawal cap $1k/day pre-KYC, $10k/day post-KYC. |
| No wallet-address risk (KYT) screening | Out of scope. Manual review of withdrawals >$10k. |

## Dropped (still over-engineered)

| Was | Why dropped |
|---|---|
| NestJS | Next.js Route Handlers + Server Actions cover the API surface. |
| Separate worker process / Fly.io / Cloudflare Worker | QStash replaces persistent processes; client polling replaces realtime. |
| Stytch | Privy is auth. |
| Persona | Sumsub picked. |
| **Pusher / Ably / Centrifugo / WebSocket server** | Client polling via TanStack Query is enough at MVP scale. Re-add at ~1k concurrent users. |
| Self-hosted `rippled` + Clio | xrplcluster.com is enough at MVP scale. |
| ComplyAdvantage / Chainalysis KYT | Compliance scope deferred. |
| Inngest, Doppler, Knock, Typesense, Storybook + Chromatic, Better Stack, Metabase | All deferable. |

## Footnote: Privy XRPL support

Verify Privy's XRPL adapter at integration time. If not natively supported in their docs, fall back to **Web3Auth XRPL adapter** (ed25519 key derivation). Architecture stays identical — only the SDK swaps.
