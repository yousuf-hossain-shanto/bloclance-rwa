# `@surgexrp/ui`

The **only** place reusable UI lives. Every screen agent composes pages from this library.

## Build pages by composing layouts + components from this library

If you think you need a new component:

1. Open `docs/design/component-catalog.md`. Find the closest existing component.
2. If a `variant` / `tone` / `size` prop solves your case, **use it**. If the prop is missing, **add it to the existing component** — do not create a new one.
3. Only add a new component if the catalog explicitly says "TBD — add when needed".
4. Reusable UI lives in `packages/ui/src/`, **never** in `apps/web/src/components/`. The `apps/web/src/components/` folder is for page-specific composition (e.g. wiring tRPC hooks into UI primitives — `ExplorePageClient.tsx`).

## Hard rules

1. **No bare `<button>`s in pages**. Use `<Button variant=...>`.
2. **No bare `<input>`s in pages**. Use `<TextField>`, `<SelectField>`, or `<AssetAmountInput>`.
3. **No custom pills/badges**. Use `<RoiBadge>`, `<StatusPill>`, `<DeltaPill>`, or `<Tabs>`.
4. **No custom modal chrome**. Use `<ModalShell>` (or the pre-built `<AuthModal>` / `<PurchaseModal>` / `<WithdrawModal>` / `<ConfirmOrderModal>`).
5. **No data fetching here**. Components accept all data via props. Hook up tRPC/actions in `apps/web` and pass mocks/data down.
6. **"use client" sparingly** — only when hooks/state are needed.

## Quick layout map per screen

| Screen | Layout | Notes |
|---|---|---|
| Explore listing | `<AppShell>` → `<CenteredListPage>` | Toolbar: `<ListToolbar options={[Highest ROI, Newest]}>` |
| Asset Detail | `<AppShell>` → `<DetailWithSidebarLayout>` | Sidebar = pricing card; tabs via `<Tabs variant="underline">` |
| Marketplace listing | `<AppShell>` → `<CenteredListPage>` | Toolbar: `<ListToolbar hideSort counterText="35 Properties Available" showFilter>` |
| Trading view | `<AppShell>` → `<TradingPageLayout>` | `<AssetHeader variant="trading">` + `<ChartPanel>` + `<OrderBookTable>` + `<BuySellTicket>` |
| Portfolio Overview | `<AppShell>` → `<DashboardLayout>` | KPI row: `<ChartPanel variant="portfolio">` + 2× `<KpiTile>`. Asset grid uses `<PropertyCard variant="holding">` |
| Portfolio → View All | `<AppShell>` → `<CenteredListPage>` | `<PropertyCard variant="holding">` cards |
| Profile | `<AppShell>` → `<ProfileLayout>` | 3× `<ProfileSectionCard>` |
| Auth modal | `<AuthModal>` | Email-only Privy step |
| Purchase modal | `<PurchaseModal>` | Triggered from Asset Detail |
| Withdraw modal | `<WithdrawModal>` | Triggered from Portfolio header |
| Confirm Order modal | `<ConfirmOrderModal>` | Triggered from Trading buy/sell submit |

## File tree

```
src/
├── components/        ← atoms, molecules, organisms, modals (flat)
├── layouts/           ← page-level templates + modal shell + app shell
├── lib/               ← cn() helper
└── index.ts           ← single export barrel
```

## See also

- `docs/design/component-catalog.md` — every component, every variant, every forbidden duplicate.
- `docs/design/layouts.md` — 7 page layouts + spacing/gutters spec.
- `docs/design/tokens.md` — colors, typography, radii.
