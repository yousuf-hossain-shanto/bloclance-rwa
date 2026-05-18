# Trading (Market / Limit / Confirm)

Secondary-market order entry. Reached from Marketplace → property card click.

Variants: 8 Market Order frames (`343:7814`, `425:8964`, `425:9271`, `425:9596`, `421:5125`, `421:5493`, `350:12549`, `350:11085`), 3 Limit Order frames (`350:10351`, `350:13320`, `350:11812`), 1 Confirm Order (`433:7762`).

## Page layout

```
[Top nav with wallet pill]
[Go back]
[Left column: Asset header + Chart + Order book/tabs]
[Right column: Order ticket card]
[Footer]
```

## Asset header (left top)

- Title pill: **The Azure Penthouse** + location pin **Miami, Florida**
- Status pill: **Active**
- Link: **View Property Details** (navigates to Explore Asset Detail)
- KPI row:
  - `Last traded price` **$600** with delta **+1.2% Last week**
  - `Total units sold` **428,587** plus secondary **71,413 / 500,000 units**
  - `Trade volume` **$12,587,971** with delta **+3% Last 4 weeks**
- Sub-KPIs:
  - `Price per unit` **$430**
  - `Available units` **71,413**
  - `Property valuation` **$12,587,971**

## Chart

Two-axis chart with tabs:
- Tabs: **Price** / **Yield**
- Timeframes: **All / 3M / 6M / 1Y**
- X-axis (Price view): dates **Apr 10, Apr 15, Apr 20, Apr 25, Apr 30, May 10**
- Y-axis (Price): **$100, $150, $200, $250, $300, $350**
- Y-axis (Yield): **10%, 20%, 40%, 60%, 80%, 100%**
- Hover tooltip example: `April 26, 2026` · `$200` · `156 units`. Sell variant shows `25 units`.

## Order book (left bottom)

- Tabs: **Open Orders** / **Filled Orders** / **Trade History**
- Default tab: **Open Orders**
- Sub-tabs: **Buy** / **Sell**
- Columns: unit count + price (alternating). Sample rows:
  ```
  65    $49     $50    66
  63    $102    $122   64
  62    $286    $189   63
  60    $145    $64    62
  60    $97     $104   62
  59    $97     $104   60
  58    $97     $104   60
                       49
  ```
  (Left two cols = bid side, right two = ask side, or vice versa — confirm with design.)

## Order ticket (right column)

Sticky card. Common fields across Market/Limit:

- **Side toggle** (top): `Buy` / `Sell`
- **Order Type** selector: `Market Order` | `Limit Order`
- **Choose Units** stepper (default `3` in Market mock, `1` in Limit mock)
- **Available balance** + **Select Asset** dropdown (`RLUSD` default)
- Primary action button: `Buy` (or `Sell` when Sell side active) — gold, full-width
- Disclaimer: *"Disclaimer: Ensure to verify the amount of units and right amount you are about to purchase to avoid over purchasing an asset. This order will be filled at the market price."*

### Market Order specific

- Read-only: `Market Price` **$600**
- Read-only: `Total Payable` **$1,800** (= units × market price)

### Limit Order specific

- Editable: `Price per Unit` input with `$` prefix (mock values: `125`, `500`)
- Read-only: `Limit Price` **$125** (mirrors input)
- Read-only: `Total Payable` **$125** (buy) or `Total Receivable` **$550** (sell)

### Side variants (mocked across 8 market order frames + 3 limit)

- Buy active
- Sell active
- Different unit counts
- Different prices
- Likely: insufficient-funds error, max-units cap, slippage warning. (Not separately mapped in current dump — confirm by reading individual frames when implementing.)

## Confirm Order modal (`433:7762`)

Triggered by Buy/Sell button. Modal contents:

- Title: `Purchase shares for`
- Property name + location
- ROI badge: **11.2% ROI**
- Summary rows:
  - `Order type` **Market Order**
  - `Units to buy` **300**
  - `Price per unit` **$430**
  - `Asset for purchase` **RLUSD**
  - `Total` **$368,258**
- Primary: `Confirm Buy` (gold)
- Footer note: *"The asset right will be transferred to you once trade is matched"*

(Sell-side Confirm copy not in current export — assume mirror: `Confirm Sell`, *"Funds released once trade is matched"*.)

## Settlement assets

`XRP` and `RLUSD` are the two payment currencies. `Select Asset` dropdown lets user choose either. RLUSD is the default in trading mocks.

## State coverage to design before build

- Insufficient balance error in ticket (analogous to Purchase: *"Oops! insufficient funds"* + Fund Wallet CTA)
- Min/max unit caps + validation
- Order submit loading + success + failure
- Empty order book
- Chart loading skeleton
