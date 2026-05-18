# apps/web

Next.js (latest) app for SurgeXRP. App Router, TypeScript strict, Tailwind v4, tRPC, next-safe-action, Privy.

## Layout + reuse principle

This app **does not** define its own nav, footer, or domain widgets. Everything reusable lives in `packages/ui` and is imported here.

| Concern | Lives in | Used by |
|---|---|---|
| Top nav + footer chrome | `@surgexrp/ui` → `<AppShell>` | Every page |
| Property tile (3 variants: explore, trading, holding) | `@surgexrp/ui` → `<PropertyCard variant="…" />` | Explore, Marketplace, Portfolio |
| Sort / filter toolbar | `@surgexrp/ui` → `<ListToolbar>` | Explore, Marketplace |
| Asset header (name, pin, ROI, KPIs) | `@surgexrp/ui` → `<AssetHeader>` | Asset detail, Trading view |
| Amount input with asset suffix + Max | `@surgexrp/ui` → `<AssetAmountInput>` | Withdraw modal, Purchase modal |
| Pagination (Showing X-Y of Z + page numbers + rows-per-page) | `@surgexrp/ui` → `<PaginationBar>` | Explore, Marketplace, Holdings |
| KPI tile, ROI badge, status pill, empty state, section header | `@surgexrp/ui` | All screens |

**Rule**: if you find yourself copy-pasting JSX between two screens, lift it into `packages/ui` before merging.

## Folder layout

```
apps/web/src/
├── app/                       # App Router pages + Route Handlers
│   ├── api/trpc/[trpc]/       # tRPC fetch handler
│   ├── globals.css            # Design tokens via @theme
│   ├── layout.tsx             # Root layout + Providers
│   └── page.tsx               # Explore (home)
├── actions/                   # next-safe-action server actions
│   ├── safe-action.ts         # authActionClient + kycActionClient
│   ├── profile.ts             # updateProfile, uploadAvatar
│   ├── kyc.ts                 # startKyc
│   ├── purchases.ts           # submitPurchase
│   ├── orders.ts              # placeOrder, cancelOrder
│   ├── withdrawals.ts         # submitWithdrawal
│   └── settings.ts            # toggleAutoReinvest
├── trpc/
│   ├── init.ts                # publicProcedure, protectedProcedure, kycProcedure
│   ├── query-client.ts        # superjson dehydrate/hydrate + 30s staleTime
│   ├── react.tsx              # <TRPCProvider> client
│   ├── server.ts              # RSC caller + <HydrateClient>
│   └── routers/               # _app, auth, properties, portfolio, orders,
│                              # purchases, withdrawals, wallets, tx
├── providers/                 # Privy + tRPC providers wrapped in <Providers>
├── components/                # Small app-local glue (e.g. ClientToolbar)
└── lib/                       # utilities
```

## Scripts

```bash
pnpm --filter web dev          # next dev (Turbopack)
pnpm --filter web build        # next build
pnpm --filter web type-check
pnpm --filter web test         # vitest
pnpm --filter web test:e2e     # playwright
```

## Environment

See root `.env.example`. Copy to `.env.local` for local dev.

## Stack reference

- Stack picks: `docs/technical/stack.md`
- Architecture: `docs/technical/architecture.md`
- tRPC layout: `docs/technical/api-surface.md` (recipe: <https://nisabmohd.vercel.app/trpc-app-router>)
- Design tokens: `docs/design/tokens.md`
