# Component Catalog

**Source of truth** for every reusable UI element. Screen agents MUST consult this before writing JSX. If you think you need a new component, first re-read this file and look for an existing component with a missing variant prop.

All components live in `packages/ui/src/`. Pure presentation, no data fetching. Data flows in via props.

Conventions:

- File: `kebab-case.tsx`. Export: `PascalCase`.
- Variants are declared on a single component via discriminated `variant`/`tone`/`size`/`state` props — never two near-duplicate components.
- "use client" only when hooks/state are needed (interactive controls). All else is server-friendly.
- Tailwind v4 utility classes only; tokens via CSS vars in `apps/web/src/app/globals.css`.
- Glassmorphic + dark theme: surfaces use `bg-bg-tertiary/60`, `border-white/5`, `backdrop-blur-md` unless solid is required.

---

## Atoms

### `RoiBadge`

ROI percentage chip used on every property card and asset header.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| number` | — | Percent number, no `%` suffix. |
| `variant` | `"solid" \| "outline"` | `"solid"` | Solid = gold fill, dark text. Outline = gold border, gold text. |
| `className` | `string` | — | Override. |

**Used on**: Explore card, Marketplace card, Holding card, Asset Detail header, Trading asset header, Purchase modal, Confirm Order modal.

ASCII: `[ 11.2% ROI ]` (rounded-full pill, gold).

Composition: standalone leaf.

**Forbidden duplicates**: do NOT make `PropertyRoiBadge`, `ModalRoiBadge`, `HeaderRoiBadge`. Use `RoiBadge` with `variant`.

### `StatusPill`

Status / KYC / active indicator.

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `"success" \| "warning" \| "error" \| "neutral" \| "gold"` | `"neutral"` | Color scheme. |
| `children` | `ReactNode` | — | Label text + optional icon. |
| `className` | `string` | — | Override. |

**Used on**: Trading asset header (`Active`), Profile (`Verified`/`Not Verified`), Wallet dropdown KYC row, Withdraw/Purchase error states.

ASCII: `( • Active )` (rounded-full, tone-colored bg + text).

**Forbidden duplicates**: do NOT make `KycBadge`, `VerifiedPill`, `ActivePill`. Use `StatusPill tone="success"` etc. The `<KycPill>` macro is **only** allowed because it specializes the children for KYC (label + Verify CTA composition) — it internally renders `StatusPill`.

### `DeltaPill`

Compact +/- delta with bg tint. Already inlined inside `KpiTile`. Exposed standalone too.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Numeric string, no sign. |
| `direction` | `"up" \| "down"` | — | Adds `+` or `-` prefix, picks tone. |
| `suffix` | `string` | — | E.g. `"Last week"`. |
| `size` | `"sm" \| "md"` | `"sm"` | Affects padding + text size. |

**Forbidden duplicates**: do NOT make `PriceDeltaBadge`, `WeeklyDelta`. Use `DeltaPill`.

### `Button`

The one button component. **Do not create new buttons elsewhere.**

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | Primary = gold gradient. Secondary = white outline. Ghost = text only. Danger = red outline. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | sm=h-8, md=h-10, lg=h-12. |
| `fullWidth` | `boolean` | `false` | Stretch to container width. |
| `loading` | `boolean` | `false` | Shows spinner, disables click. |
| `leftIcon` / `rightIcon` | `ReactNode` | — | Optional icon slots. |
| `as` | `"button" \| "a"` | `"button"` | Render as anchor for navigation. |

**Used on**: every CTA — `Invest now`, `Withdraw Earning`, `Continue`, `Purchase Now`, `Confirm Buy`, `Verify`, `Buy`/`Sell`, `Copy`, `Max.`, `Filter`, `View All`, `Log in`, `Sign Up`, `Go back`.

**Forbidden duplicates**: do NOT make `GoldButton`, `CTAButton`, `PrimaryButton`, `IconButton`. Use `Button` with variant/size.

### `IconButton`

Square button for icon-only actions (close, copy). Internally `Button size="sm"` with square padding. Allowed as a thin wrapper because it enforces `aria-label` requirement.

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `ReactNode` | — | Required. |
| `label` | `string` | — | Required for `aria-label`. |
| `tone` | `"neutral" \| "gold" \| "danger"` | `"neutral"` | Picks border/text color. |

### `TextField`

The one text/email/number input. **Do not use bare `<input>` in pages.**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Above input. |
| `helperText` / `errorText` | `string` | — | Below input. `errorText` flips border to red. |
| `prefix` / `suffix` | `ReactNode` | — | Slot in left/right (e.g. `$`, `XRP`, `Max.`). |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Padding. |
| All standard `<input>` props | — | — | Forwarded. |

Wraps native `<input>`. `AssetAmountInput` extends this with the Max + asset-code suffix composition — kept as a separate file because it's used identically across Purchase/Withdraw/Trading.

**Forbidden duplicates**: do NOT make `EmailInput`, `NumberInput`, `PriceInput`, `WalletAddressInput`. Use `TextField` with `type`, `prefix`, `suffix`, `helperText`.

### `AssetAmountInput`

Specialization of `TextField` for crypto amounts with `Max.` button + asset-code chip suffix.

Already in library. **Keep as-is.** Extended only by accepting an optional `usdEquivalent` slot — covered by `helperText`.

### `SelectField`

Dropdown for `Select Asset`, `Order Type`, `Rows per page`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Optional. |
| `options` | `{ label: string; value: string }[]` | — | Options list. |
| `value` | `string` | — | Current. |
| `onChange` | `(value: string) => void` | — | Handler. |
| `placeholder` | `string` | — | When unselected. |
| `prefix` / `suffix` | `ReactNode` | — | Slots (e.g. asset icon). |
| `size` | `"sm" \| "md"` | `"md"` | — |

**Forbidden duplicates**: do NOT make `AssetSelect`, `OrderTypeSelect`. Use `SelectField`.

### `Tabs` / `TabsRow`

Pill-toggle row used everywhere a screen has segmented choice.

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `{ label: string; value: T; count?: number }[]` | — | Tabs. |
| `value` | `T` | — | Active. |
| `onChange` | `(value: T) => void` | — | Handler. |
| `variant` | `"pill" \| "underline" \| "segmented"` | `"pill"` | pill=`bg-gold` active background (sort, side, sub-tabs). underline=text + gold underline (asset detail tabs). segmented=glass background with embedded pill (timeframes). |
| `size` | `"sm" \| "md"` | `"md"` | — |
| `fullWidth` | `boolean` | `false` | Stretch buttons equally. |

**Used on**: `Highest ROI / Newest`, `About / Financials / Documents / Order Book`, `All / 3M / 6M / 1Y`, `Buy / Sell`, `Open / Filled / History`, `Price / Yield`, `Market / Limit` (order type).

**Forbidden duplicates**: do NOT make `TimeframeTabs`, `SortTabs`, `OrderSideTabs`, `BuySellToggle`, `OrderTypeTabs`. **All of them are `<Tabs>` with different `variant` and options.**

### `Avatar`

Profile picture circle.

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | Image URL. |
| `name` | `string` | — | Used for initials fallback + alt. |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | 32 / 48 / 64 / 96 px. |

**Used on**: Profile page header, wallet dropdown (small).

### `LocationLabel`

`<map-pin /> City, Region` text. Used in 6+ places — break out to enforce consistent spacing/color.

| Prop | Type | Default | Description |
|---|---|---|---|
| `city` | `string` | — | — |
| `region` | `string` | — | — |
| `size` | `"sm" \| "md"` | `"sm"` | — |

**Forbidden duplicates**: do NOT inline `<MapPin />` + text again. Use `LocationLabel`.

### `CopyableAddress`

Truncated address + Copy button. Used in wallet dropdown, Profile wallet rows, Withdraw destination input read-back.

| Prop | Type | Default | Description |
|---|---|---|---|
| `address` | `string` | — | Full XRPL r-address. |
| `truncate` | `boolean` | `true` | Show `r62UiV...HfFA` vs full. |
| `label` | `string` | — | Optional label above (`XRP Wallet`). |
| `size` | `"sm" \| "md"` | `"md"` | — |

### `Skeleton`

Loading placeholder rectangle.

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Pass size via Tailwind. |
| `rounded` | `"sm" \| "md" \| "lg" \| "full"` | `"md"` | — |

---

## Molecules

### `KpiTile`

Compact stat card.

Already in library. **Extend** with new props:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | — |
| `value` | `ReactNode` | — | — |
| `delta` | `{ value, direction, suffix }` | — | Optional. |
| `secondary` | `ReactNode` | — | **NEW** — secondary subtext, e.g. `71,413 / 500,000 units`, USD equivalent. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | **NEW** — `lg` for portfolio hero KPI row. |
| `tone` | `"default" \| "highlight"` | `"default"` | **NEW** — `highlight` adds gold border + bg. |

**Used on**: Asset header (4 tiles), Trading asset header (3 main + 3 sub), Portfolio header (Wallet Value, RWA Assets Owned). Portfolio Value chart card composes a larger `ChartPanel` — not a `KpiTile`.

**Forbidden duplicates**: do NOT make `WalletBalanceTile`, `AssetCountTile`, `TradingKpi`. Use `KpiTile`.

### `SectionHeader`

Page-level heading block.

Already in library. **Extend** with:

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | — |
| `subtitle` | `string` | — | — |
| `right` | `ReactNode` | — | CTA slot. |
| `size` | `"sm" \| "md" \| "lg"` | `"lg"` | **NEW** — `sm` for in-card subsection headings, `md` for `All Assets`/`Your Surge Wallets` section headings. |
| `align` | `"left" \| "center"` | `"left"` | **NEW** — `center` for modal titles. |

**Forbidden duplicates**: do NOT make `ModalHeader`, `SubsectionHeader`. Use `SectionHeader` with `size` + `align`.

### `EmptyState`

Empty state card.

Already in library. **Keep as-is.**

**Used on**: Empty Portfolio, empty Order Book, no-results listings.

### `PaginationBar`

Already in library. **Keep as-is.**

### `ListToolbar`

Sort/Filter toolbar.

Already in library. **Extend** with:

| Prop | Type | Default | Description |
|---|---|---|---|
| `sortLabel` | `string` | `"Sort by:"` | — |
| `options` | `ToolbarOption<T>[]` | — | — |
| `value` | `T` | — | — |
| `onChange` | `(v: T) => void` | — | — |
| `showFilter` | `boolean` | `false` | Shows Filter button. |
| `onFilterClick` | `() => void` | — | — |
| `counterText` | `string` | — | **NEW** — left-side counter, e.g. `35 Properties Available`. |
| `hideSort` | `boolean` | `false` | **NEW** — Marketplace shows counter + filter only, no sort tabs. |

**Forbidden duplicates**: do NOT make `MarketplaceToolbar`, `PortfolioToolbar`, `ExploreToolbar`. **Single component**, drive content with props.

### `PropertyCard`

Already in library, with `variant="explore" | "trading" | "holding"`. **Keep as-is** (it already follows the variant pattern).

**Forbidden duplicates**: do NOT make `ExploreCard`, `MarketplaceCard`, `HoldingCard`, `OwnedAssetCard`. Use `PropertyCard` with `variant`.

### `OrderBookRow`

Single row of the order book.

| Prop | Type | Default | Description |
|---|---|---|---|
| `bidUnits` | `number` | — | Bid side units. |
| `bidPrice` | `string` | — | Bid price in USD. |
| `askUnits` | `number` | — | Ask side units. |
| `askPrice` | `string` | — | Ask price in USD. |
| `state` | `"default" \| "highlighted"` | `"default"` | Highlighted = user's own order. |

Renders 4 numeric cells with bid red-tinted left, ask green-tinted right.

### `FormRow`

Label + read-only value row used in summary cards (Withdraw `Available balance`, Purchase `Total`, Confirm Order summary).

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Left. |
| `value` | `ReactNode` | — | Right. |
| `tone` | `"default" \| "muted" \| "emphasis"` | `"default"` | `emphasis` = larger gold value (e.g. `Total`). |

**Used on**: Withdraw summary, Purchase summary, Confirm Order summary, KPI breakdowns in Wallet Value tile.

**Forbidden duplicates**: do NOT make `SummaryRow`, `BalanceRow`, `OrderSummaryItem`, `WalletBreakdownRow`. Use `FormRow`.

### `WalletAddressRow`

Profile-specific wallet row: label + address + Copy. Internally composes `CopyableAddress`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | E.g. `XRP Wallet`. |
| `address` | `string` | — | — |
| `helperText` | `string` | — | Optional. |

### `NoticeBanner`

Inline informational banner (e.g. `Fund wallet with local currency is coming soon`, Trading disclaimer, Purchase footer).

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `"info" \| "warning" \| "success" \| "error"` | `"info"` | — |
| `icon` | `ReactNode` | — | Optional. |
| `children` | `ReactNode` | — | — |

**Forbidden duplicates**: do NOT make `DisclaimerBox`, `ComingSoonBanner`, `InsufficientFundsAlert`. Use `NoticeBanner`.

---

## Organisms

### `TopNav`

Already in library. **Extend** to support wallet pill auth slot variants via composition — already does this with `authSlot`. Keep as-is.

### `WalletPill`

The authenticated state of the top-nav right slot. Renders short address + caret. On click, opens `WalletMenu`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `address` | `string` | — | XRPL r-address. |
| `kycStatus` | `"verified" \| "unverified"` | `"unverified"` | — |
| `xrpAddress` / `rlusdAddress` | `string` | — | For dropdown. |
| `onSignOut` | `() => void` | — | — |
| `LinkComponent` | `ElementType` | `"a"` | For Next.js Link. |

### `Footer`

Already in library. **Keep as-is.**

### `AssetHeader`

Already in library. **Extend** with:

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | — |
| `locationCity` / `locationRegion` | `string` | — | — |
| `roiAnnualPct` | `string` | — | — |
| `kpis` | `AssetHeaderKpi[]` | — | — |
| `variant` | `"detail" \| "trading"` | `"detail"` | **NEW** — `trading` includes status pill row + `View Property Details` link + sub-KPIs. |
| `status` | `"active" \| "paused"` | — | **NEW** — trading variant only. |
| `subKpis` | `AssetHeaderKpi[]` | — | **NEW** — second smaller KPI row, trading variant. |
| `actionSlot` | `ReactNode` | — | **NEW** — right-side slot for `View Property Details` link or `Invest now` CTA. |

**Forbidden duplicates**: do NOT make `TradingAssetHeader`, `PropertyDetailHeader`. Use `AssetHeader` with `variant`.

### `ChartPanel`

Line chart card with timeframe tabs.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Optional title above chart. |
| `value` | `ReactNode` | — | Hero value (e.g. `$16,587,811`). |
| `timeframes` | `{ label, value }[]` | `[All, 3M, 6M, 1Y]` | Default 4. |
| `activeTimeframe` | `string` | — | — |
| `onTimeframeChange` | `(v: string) => void` | — | — |
| `data` | `{ x: string; y: number }[]` | — | Mock data — agents pass through. |
| `tabs` | `{ label, value }[]` | — | Optional inner tabs (Price / Yield). |
| `activeTab` | `string` | — | — |
| `onTabChange` | `(v) => void` | — | — |
| `legend` | `{ label: string; tone: "up" \| "down" }[]` | — | Optional. |
| `variant` | `"portfolio" \| "trading"` | `"portfolio"` | Visual density. |
| `loading` | `boolean` | `false` | Renders skeleton. |

**Used on**: Portfolio Overview (Portfolio Value), Trading view (Price/Yield chart).

**Forbidden duplicates**: do NOT make `PortfolioValueChart`, `TradingChart`, `PriceChart`. Use `ChartPanel` with `variant`.

> MVP note: this is a presentational shell — actual SVG/canvas chart can be a stubbed gradient block with axis labels for v1; screen agents wire data via props.

### `OrderBookTable`

Order book with side tabs + columns.

| Prop | Type | Default | Description |
|---|---|---|---|
| `tabs` | `{ label, value }[]` | `[Open, Filled, History]` | — |
| `activeTab` | `string` | — | — |
| `onTabChange` | `(v) => void` | — | — |
| `side` | `"buy" \| "sell"` | `"buy"` | — |
| `onSideChange` | `(s) => void` | — | — |
| `rows` | `OrderBookRowData[]` | — | — |
| `loading` | `boolean` | `false` | — |
| `emptyText` | `string` | `"No orders"` | — |

Internally composes `Tabs` + `OrderBookRow`.

### `BuySellTicket`

Right-column order entry card on trading view. Encapsulates Side/Type/Units/Asset/Price/Total layout for both Market AND Limit (driven by `orderType` prop).

| Prop | Type | Default | Description |
|---|---|---|---|
| `side` | `"buy" \| "sell"` | `"buy"` | — |
| `onSideChange` | `(s) => void` | — | — |
| `orderType` | `"market" \| "limit"` | `"market"` | Drives whether `Price per Unit` input is shown. |
| `onOrderTypeChange` | `(t) => void` | — | — |
| `units` | `number` | — | — |
| `onUnitsChange` | `(n) => void` | — | — |
| `pricePerUnit` | `string` | — | Read-only in market, editable in limit. |
| `onPricePerUnitChange` | `(p) => void` | — | Limit only. |
| `marketPrice` | `string` | — | Display only. |
| `total` | `string` | — | Computed by parent. |
| `availableBalance` | `string` | — | — |
| `selectedAsset` | `"XRP" \| "RLUSD"` | `"RLUSD"` | — |
| `onAssetChange` | `(a) => void` | — | — |
| `errorText` | `string` | — | Insufficient funds etc. |
| `onSubmit` | `() => void` | — | — |
| `loading` | `boolean` | `false` | — |

**Forbidden duplicates**: do NOT make `MarketOrderTicket`, `LimitOrderTicket`, `OrderForm`. Use `BuySellTicket` with `orderType`.

### `FilterPanel`

Right-side drawer or popover for marketplace filters.

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | — |
| `onClose` | `() => void` | — | — |
| `priceRange` | `[number, number]` | — | — |
| `yieldRange` | `[number, number]` | — | — |
| `onPriceChange` / `onYieldChange` | `(r) => void` | — | — |
| `onApply` / `onReset` | `() => void` | — | — |

### `ProfileSectionCard`

A bordered section card used 3× on Profile (Surge Wallets, Human Verification, Your Details).

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | — |
| `subtitle` | `string` | — | — |
| `children` | `ReactNode` | — | — |
| `right` | `ReactNode` | — | Optional CTA slot. |

**Forbidden duplicates**: do NOT make `WalletsCard`, `VerificationCard`, `DetailsCard`. Use `ProfileSectionCard`.

### `KycPill`

Composes `StatusPill` for the KYC status display in wallet dropdown + Profile.

| Prop | Type | Default | Description |
|---|---|---|---|
| `status` | `"verified" \| "unverified"` | — | — |
| `onVerifyClick` | `() => void` | — | Shown only when `unverified`. |

---

## Templates / Layouts

See `docs/design/layouts.md` for full spec. List of layouts:

- `AppShell` — already in library. Top nav + main + footer.
- `CenteredListPage` — single column, hero + toolbar + grid + pagination.
- `DetailWithSidebarLayout` — single-column hero + tabs (used by Asset Detail, despite name; sidebar is the right-side pricing card).
- `TradingPageLayout` — two-column desktop (chart+orderbook LEFT, ticket RIGHT sticky).
- `DashboardLayout` — single column, KPI row + chart + section grid (Portfolio Overview).
- `ProfileLayout` — single column vertical sections.
- `ModalShell` — centered overlay with header / body / footer slots and glass backdrop.

---

## Modals

All modals use `ModalShell` as the wrapper. **Do not write modal chrome (backdrop, container, close button) inline in pages.** Build modal contents using the shell + atoms/molecules.

### `AuthModal`

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | — |
| `onClose` | `() => void` | — | — |
| `onSubmit` | `(email: string) => void \| Promise<void>` | — | — |
| `loading` | `boolean` | `false` | — |
| `errorText` | `string` | — | — |

### `PurchaseModal`

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | — |
| `onClose` | `() => void` | — | — |
| `property` | `{ name, location, roi, pricePerUnit, unitsAvailable, minUnits }` | — | — |
| `units` | `number` | — | — |
| `onUnitsChange` | `(n) => void` | — | — |
| `selectedAsset` | `"XRP" \| "RLUSD"` | — | — |
| `onAssetChange` | `(a) => void` | — | — |
| `availableBalance` | `string` | — | — |
| `total` | `string` | — | — |
| `insufficientFunds` | `boolean` | `false` | — |
| `onFundWallet` | `() => void` | — | — |
| `onSubmit` | `() => void` | — | — |
| `loading` | `boolean` | `false` | — |

### `WithdrawModal`

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | — |
| `onClose` | `() => void` | — | — |
| `selectedAsset` | `"XRP" \| "RLUSD" \| ""` | `""` | — |
| `onAssetChange` | `(a) => void` | — | — |
| `availableBalance` | `string` | — | — |
| `walletAddress` | `string` | — | — |
| `onWalletAddressChange` | `(a) => void` | — | — |
| `amount` | `string` | — | — |
| `onAmountChange` | `(a) => void` | — | — |
| `onMaxClick` | `() => void` | — | — |
| `usdEquivalent` | `string` | — | XRP only. |
| `total` | `string` | — | — |
| `errorText` | `string` | — | — |
| `onSubmit` | `() => void` | — | — |
| `loading` | `boolean` | `false` | — |

### `ConfirmOrderModal`

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | — |
| `onClose` | `() => void` | — | — |
| `side` | `"buy" \| "sell"` | — | — |
| `property` | `{ name, location, roi }` | — | — |
| `orderType` | `"market" \| "limit"` | — | — |
| `units` | `number` | — | — |
| `pricePerUnit` | `string` | — | — |
| `selectedAsset` | `"XRP" \| "RLUSD"` | — | — |
| `total` | `string` | — | — |
| `onConfirm` | `() => void` | — | — |
| `loading` | `boolean` | `false` | — |

**Forbidden duplicates**: do NOT make `MarketConfirmModal` + `LimitConfirmModal`. Use `ConfirmOrderModal` with `orderType`.

---

## Quick reference — "which component for which design element"

| Visual element across screens | Component |
|---|---|
| Any gold pill button | `Button variant="primary"` |
| Any white-outlined button | `Button variant="secondary"` |
| Text-only nav link / `Go back` | `Button variant="ghost"` |
| Any ROI chip | `RoiBadge` |
| Any status indicator | `StatusPill` (or `KycPill` for KYC specifically) |
| `+1.2% Last week` style delta | `DeltaPill` (or `KpiTile`'s built-in delta) |
| Map-pin + location text | `LocationLabel` |
| Truncated wallet address + Copy | `CopyableAddress` |
| Any text input / email / number / address | `TextField` (or `AssetAmountInput` for asset+Max) |
| Any dropdown | `SelectField` |
| Any pill toggle group (sort, side, timeframe, type, sub-tabs) | `Tabs` |
| Stat tile (single value with label) | `KpiTile` |
| Section heading on a page | `SectionHeader` |
| Page-level title + subtitle | `SectionHeader size="lg"` |
| In-card section title | `SectionHeader size="md"` |
| Property tile in grid | `PropertyCard` with `variant` |
| Order book row | `OrderBookRow` |
| Order book panel | `OrderBookTable` |
| Right-column order entry | `BuySellTicket` |
| Trading chart card | `ChartPanel variant="trading"` |
| Portfolio chart card | `ChartPanel variant="portfolio"` |
| Asset detail header | `AssetHeader variant="detail"` |
| Trading view asset header | `AssetHeader variant="trading"` |
| Label + value row in summary | `FormRow` |
| Empty state | `EmptyState` |
| Pagination | `PaginationBar` |
| Sort/Filter toolbar | `ListToolbar` |
| Profile section | `ProfileSectionCard` |
| Profile wallet row | `WalletAddressRow` |
| Inline info/disclaimer | `NoticeBanner` |
| Any modal | `ModalShell` + content molecules (or use the pre-built `AuthModal` / `PurchaseModal` / `WithdrawModal` / `ConfirmOrderModal`) |

---

## Hard rules for screen agents

1. **Never** write a `<div>` styled like a button. Use `Button`.
2. **Never** style a custom pill. Use `StatusPill`, `RoiBadge`, `DeltaPill`, or `Tabs`.
3. **Never** style a custom input. Use `TextField` / `AssetAmountInput` / `SelectField`.
4. **Never** roll a new modal backdrop. Use `ModalShell`.
5. **Never** add a near-duplicate component. If you need a variant, **extend the existing component's props**.
6. **Never** put reusable UI in `apps/web/src/components/`. That folder is for page-specific composition only (e.g. `ExplorePageClient` that wires hooks + tRPC into UI primitives).
7. If you're tempted to break rule 5: stop, open this catalog, find the closest existing component, and add a `variant` / `tone` / `size` prop instead.
