# Layouts

The 7 page-layout templates that every screen MUST use. Screen agents pick a layout, then fill named slots. Do not invent new layouts.

All layouts respect:

- Canvas: 1440px design width.
- Outer content container: `max-w-7xl` (1280px) with `px-6` on mobile, page padding handled by layout.
- Vertical rhythm: `py-10` on main, `space-y-8` between top-level sections, `space-y-6` inside cards.
- Background: `bg-bg-primary` everywhere; surfaces use glass overlays (`bg-bg-tertiary/60`, `border-white/5`, `backdrop-blur-md`).

Spacing tokens (from `docs/design/tokens.md`):

| Use | Value | Tailwind |
|---|---|---|
| Outer page padding (x) | 24px | `px-6` |
| Outer page padding (y) | 40px | `py-10` |
| Section gap | 32px | `space-y-8` / `gap-8` |
| Card padding (inner) | 20–24px | `p-5` / `p-6` |
| Modal panel padding | 32–40px | `p-8` / `p-10` |
| Grid gap (cards) | 24px | `gap-6` |
| Tab-to-content gap | 16–24px | `mt-4` / `mt-6` |
| Form field gap | 16px | `space-y-4` |

Radii: containers `rounded-2xl` (16px), large hero/modal `rounded-[50px]` (50px), pills `rounded-full`.

---

## 1. `AppShell`

The root chrome — every authenticated and unauth route except dedicated focus pages renders inside `AppShell`. Already in library.

Slots: `children`, `navLinks`, `authSlot`, `brand`.

```
┌─────────────────────────────────────────────┐
│ TopNav   logo  Overview Explore Marketplace  Wallet/SignUp │
├─────────────────────────────────────────────┤
│                                             │
│   {children}                                │
│                                             │
├─────────────────────────────────────────────┤
│ Footer  disclaimer · social · ©             │
└─────────────────────────────────────────────┘
```

Behavior: `contained` prop wraps children in `max-w-7xl mx-auto px-6 py-10`. Pages can pass `contained={false}` if they want to draw their own full-bleed sections.

---

## 2. `CenteredListPage`

Used by: **Explore listing**, **Marketplace listing**, **Portfolio → View All**.

Single column. Hero header → toolbar → grid → pagination.

Slots: `header`, `toolbar`, `children` (the grid), `pagination`.

```
┌──────────────────────────────────────────┐
│ SectionHeader (title + subtitle + right) │
├──────────────────────────────────────────┤
│ ListToolbar (sort | counter | filter)    │
├──────────────────────────────────────────┤
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐               │
│  │   │  │   │  │   │  │   │               │
│  └───┘  └───┘  └───┘  └───┘               │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐               │
│  │   │  │   │  │   │  │   │               │
│  └───┘  └───┘  └───┘  └───┘               │
├──────────────────────────────────────────┤
│ PaginationBar                            │
└──────────────────────────────────────────┘
```

Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`.

Implementation: a layout component that arranges children in vertical sections with `space-y-6`. Page passes header/toolbar/grid/pagination as props.

---

## 3. `DetailWithSidebarLayout`

Used by: **Asset Detail** (Explore → click card).

Hero image (full-bleed within container) → two-col `(title + meta) | (right-side sticky pricing card)` → tabs → tab body.

Slots: `hero`, `headline`, `sidebar` (sticky right column on lg+), `tabs`, `body`.

```
┌──────────────────────────────────────────┐
│ Go back                                  │
├──────────────────────────────────────────┤
│ Hero image (aspect 16/7, rounded-[50px]) │
├──────────────────────────────────────────┤
│ Headline block       │  Sidebar          │
│ Title + Location     │  Price/unit       │
│ KPI row (4 tiles)    │  Units avail      │
│                      │  ROI              │
│                      │  Stepper          │
│                      │  Invest now       │
│                      │  Min investment   │
├──────────────────────┴───────────────────┤
│ Tabs (About / Financials / Docs / Order) │
├──────────────────────────────────────────┤
│ Tab body                                 │
└──────────────────────────────────────────┘
```

Grid: `grid-cols-1 lg:grid-cols-[1fr_360px] gap-8`. Sidebar `lg:sticky lg:top-24`.

---

## 4. `TradingPageLayout`

Used by: **Trading view (Market / Limit)**.

Two-column desktop. Left = asset header + chart + order book stacked. Right = sticky buy/sell ticket.

Slots: `back`, `assetHeader`, `chart`, `orderBook`, `ticket`.

```
┌─────────────────────────────────────────────┐
│ Go back                                     │
├──────────────────────────────────────┬──────┤
│ AssetHeader variant="trading"        │ Buy/ │
│                                      │ Sell │
├──────────────────────────────────────┤Ticket│
│ ChartPanel variant="trading"         │      │
│                                      │ (sticky │
├──────────────────────────────────────┤  top │
│ OrderBookTable                       │  24) │
│                                      │      │
└──────────────────────────────────────┴──────┘
```

Grid: `grid-cols-1 lg:grid-cols-[1fr_380px] gap-8`. Ticket `lg:sticky lg:top-24 lg:self-start`.

---

## 5. `DashboardLayout`

Used by: **Portfolio Overview**.

Single column. Header + CTA → KPI row → All Assets section → grid.

Slots: `header`, `kpis`, `children`.

```
┌──────────────────────────────────────────┐
│ SectionHeader (Overview · Withdraw CTA)  │
├──────────────────────────────────────────┤
│  ┌──────────────────┐ ┌───────┐ ┌──────┐ │
│  │ Portfolio Value  │ │Wallet │ │Assets│ │
│  │ (ChartPanel)     │ │Value  │ │Owned │ │
│  │                  │ │ KPI   │ │ KPI  │ │
│  └──────────────────┘ └───────┘ └──────┘ │
├──────────────────────────────────────────┤
│ SectionHeader size="md" (All Assets · View All) │
├──────────────────────────────────────────┤
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐               │
│  │   │  │   │  │   │  │   │               │
│  └───┘  └───┘  └───┘  └───┘               │
└──────────────────────────────────────────┘
```

KPI row grid: `grid-cols-1 md:grid-cols-3 gap-6` where ChartPanel spans `md:col-span-1` but visually larger via inner sizing. (Adjust: actual mock places the chart larger — implement as `grid-cols-1 lg:grid-cols-[2fr_1fr_1fr]`.)

---

## 6. `ProfileLayout`

Used by: **Profile**.

Vertical sections of `ProfileSectionCard`s.

Slots: `header`, `avatar`, `children` (cards).

```
┌──────────────────────────────────────────┐
│ SectionHeader (Profile · subtitle)       │
├──────────────────────────────────────────┤
│ Avatar + Change Profile Picture          │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ Your Surge Wallets (ProfileSectionCard) │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ Human Verification                   │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ Your Details                         │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

Outer width: `max-w-3xl mx-auto` (narrower than other pages). Section gap: `space-y-6`.

---

## 7. `ModalShell`

Used by: **Auth**, **Purchase**, **Withdraw**, **Confirm Order**, **Filter** (drawer variant).

Centered overlay on dark blurred backdrop. Glass panel with header / body / footer slots.

Slots: `title`, `subtitle` (optional), `header` (custom), `children` (body), `footer`, `onClose`.

```
        ┌──────────────────────────┐
        │ Title              [ X ] │
        │ Subtitle (optional)      │
        ├──────────────────────────┤
        │ {children}               │
        │                          │
        ├──────────────────────────┤
        │ Footer (primary button)  │
        └──────────────────────────┘
   (backdrop: bg-overlay-dark + blur(24))
```

Props:

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | — |
| `onClose` | `() => void` | — | — |
| `title` | `string` | — | — |
| `subtitle` | `string` | — | — |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | sm=400, md=480, lg=560 max-width. |
| `variant` | `"centered" \| "drawer"` | `"centered"` | drawer = right-side slide. |
| `children` | `ReactNode` | — | Body. |
| `footer` | `ReactNode` | — | Bottom-pinned. |
| `hideClose` | `boolean` | `false` | — |

Panel: `rounded-[50px] bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 p-8 sm:p-10`.
Backdrop: `fixed inset-0 bg-overlay-dark backdrop-blur-md`.

Body uses `space-y-4` for form fields.

---

## Mapping table — which layout for which screen

| Screen | Layout | Notes |
|---|---|---|
| Explore listing | `CenteredListPage` inside `AppShell` | Toolbar sort = Highest ROI / Newest. |
| Asset Detail | `DetailWithSidebarLayout` inside `AppShell` | Sidebar = pricing card. |
| Marketplace listing | `CenteredListPage` inside `AppShell` | Toolbar `hideSort` + `counterText` + filter button. |
| Trading view (Market/Limit) | `TradingPageLayout` inside `AppShell` | Ticket sticky right. |
| Portfolio Overview | `DashboardLayout` inside `AppShell` | KPI row + asset grid. |
| Portfolio View All | `CenteredListPage` inside `AppShell` | `hideSort` + filter, `holding` card variant. |
| Profile | `ProfileLayout` inside `AppShell` | Narrow column. |
| Auth | `ModalShell size="sm"` | Triggered over any page. |
| Purchase | `ModalShell size="md"` | Triggered over Asset Detail. |
| Withdraw | `ModalShell size="md"` | Triggered over Portfolio Overview. |
| Confirm Order | `ModalShell size="md"` | Triggered over Trading view. |

---

## Composition rules

- `AppShell` is the only layout that renders `TopNav` and `Footer`. Other layouts assume they live inside `AppShell` and emit only their inner structure.
- A page imports ONE layout. It does not stack two page-layouts.
- Sticky sidebars (`DetailWithSidebarLayout`, `TradingPageLayout`) collapse to single column below `lg:`.
- All modals render outside layout flow (portaled), receiving `open` boolean from parent state.
