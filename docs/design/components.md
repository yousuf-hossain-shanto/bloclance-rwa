# Components

Catalog of reusable UI patterns extracted from Figma.

## Documented Figma components

| Figma name | Node ID | Variants |
|---|---|---|
| `_Pagination number base` | `331:2463` | `Shape=Square/State=Default`, `Shape=Square/State=Hover/active` |
| `Icons` | `336:3970` | `Icon name=plus`, `Icon name=minus` (set is larger — exhaustive list TBD) |
| `stock item` | `346:10055` | `item=yes`, `item=no` (used in order-book rows) |
| `buy and sell cell` | `346:10068` | order-book row cell |
| `Logos / telegram-fill` | `407:22225` | footer social |

(Full set of icons is referenced inline across frames — capture exhaustively when implementing the icon library.)

## UI patterns (inferred from layouts)

### Button

Variants:
- **Primary** — gold gradient fill (`#AA8B3D → #C8A749`), gold gradient stroke, white text, 14×24/35 padding, 40/48 height, radius `999`.
- **Secondary** — transparent fill, white stroke, white text.
- **Ghost** — text only (used for `Log in`, `Go back`, `View All`).
- **Disabled** — reduced opacity, no hover.

States: default, hover (lighter gold), active (darker gold), disabled, loading (spinner replaces label).

### Input

- Dark glass background (`rgba(255,255,255,0.05)`), white text.
- Label above (`Text SM/Medium`, muted).
- Placeholder in muted gray.
- Error state: red border + red helper text below.
- Suffix slot for unit (`XRP`, `RLUSD`) or `Max.` shortcut.
- Stepper variant for numeric (`+`/`−` icons).

### Dropdown / Select

- Pill button shows current value + caret.
- Opens floating menu with `Copy` actions for wallet rows in some contexts (wallet pill dropdown).
- Used for: `Select Asset`, `Order Type`, `Rows per page`.

### Tabs

- Row of pill toggles, gold underline / fill on active.
- Used: `Highest ROI / Newest`, `About Property / Financials / Documents / Order Book`, `All / 3M / 6M / 1Y`, `Buy / Sell`, `Open Orders / Filled Orders / Trade History`, `Price / Yield`.

### Card

- Dark glass background or solid dark.
- Radius `8` (small) or `50` (large hero).
- Padding `16 24` inner.
- Optional hero image with dark fade gradient overlay for legibility.

### Badge / Pill

- Radius `999`, padding `4 10`.
- ROI badge: gold bg + dark text or transparent + gold border.
- Status pill: `Active` (green), `Verified` (green), `Not Verified` (red/neutral).

### Modal / Drawer

- Centered overlay or right-side drawer.
- Backdrop: blurred dark (`blur(24px)`, `rgba(0,0,0,0.4-0.6)`).
- Panel: glass surface, radius `50`, padding `24-40`.
- Close affordance: implicit (Go back) or X button (not visible in mocks — add).

### Pagination

Component `_Pagination number base`. Numbered pages, ellipsis (`...`), prev/next arrows (not visible but standard).

Companion controls: `Rows per page` selector.

### Asset card (two variants)

1. **Explore card** — image, name, location, ROI, price/unit, units available/total.
2. **Marketplace card** — image, name, location, ROI, trade volume, price/unit, total units.

### Order-book row

`stock item` component with `item=yes/no` variants. Row = `[units] [price]` × 2 columns (bid + ask).

### Chart

- Line chart with two-axis support (Price + Yield).
- Timeframe tabs.
- Hover tooltip card (date + value + units / %).
- Legend (Increased/Decreased on Portfolio Value chart).

### KPI tile

- Compact card: label (muted, small), value (display weight), optional delta pill (+1.2% Last week).

### Footer

- Disclaimer block with bold label + body.
- Read Full Legal Disclaimer link.
- Copyright row.
- Social icons (Telegram, Email).

## Iconography library (seen in mocks)

- map-pin (location)
- caret-down (wallet pill)
- plus / minus (unit stepper)
- copy (wallet address)
- filter (marketplace)
- shield / verification (KYC)
- check / x (status)
- arrows (pagination)
- info (?) — likely on disclaimers
- telegram-fill (social)

Full SVG export should be done from Figma `Icons` component set when implementing.
