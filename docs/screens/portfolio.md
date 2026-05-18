# Portfolio (Overview)

User dashboard. Auth required.

Variants: `365:14933`, `425:8758` (populated), `366:15918` (empty), `432:2688` (unauth marketing), `366:15583`, `441:12029` (View Asset).

## Page layout

```
[Top nav with wallet pill]
[Header: title + subtitle + Withdraw Earnings CTA]
[KPI row: Portfolio Value chart + Wallet Value + Assets Owned]
[All Assets section with View All]
[Footer]
```

## Header

- Title: **Overview**
- Subtitle: *See how your assets are performing*
- Right CTA: **Withdraw Earnings** (opens modal — see [withdraw.md](withdraw.md))

## KPIs

### Portfolio Value (large card with chart)
- Value: **$16,587,811** (sample)
- Chart timeframes: **All / 3M / 6M / 1Y**
- Legend: **Increased Value** / **Decreased Value**
- Hover tooltip example: `Jul 24, 2026` · `$8,128,688`

### Total Wallet Value
- Value: **$158,368**
- Breakdown rows:
  - `XRP` · **38,202.40 XRP** · *($55,000)*
  - `RLUSD` · **$103,368**

### RWA Assets Owned
- Count: **12**

## All Assets section

- Heading: **All Assets**
- Subtitle: *See all your owned assets below*
- Right link: **View All** → expanded list with Filter (`366:15583`)
- 4 asset cards visible (more on View All).

### Asset holding card

| Field | Example |
|---|---|
| Image | property photo |
| Name | The Azure Penthouse |
| Location | Miami, Florida |
| ROI badge | 11.2% ROI |
| Unit value | $12,587,971 |
| Units owned | 428,587 |

(Sample cards shown: Azure Penthouse, Vela Commercial Tower, Coastal Retreat Villa, Metropolitan Lofts, plus Shanti Palazo, Condo Al Cartie in View All.)

## States

### Populated (`365:14933`, `425:8758`)
KPIs filled, chart populated, 4-card asset preview.

### Empty (`366:15918`)
- Portfolio Value: **$0.00**
- Wallet Value: **$0.00** (XRP 0, RLUSD 0)
- Assets Owned: **0**
- Center copy: **No assets in your portfolio**
- (CTA likely "Explore properties" — not in dump, add in implementation.)

### Unauthenticated (`432:2688`)
Marketing card replaces dashboard:
- Heading: **Supercharge Your Earnings With RWA**
- Body: *Earn passive incomes from RWA all over the globe and grow your portfolio*
- (CTA implied: Log in / Sign Up — both visible in top nav.)

## Overview View Asset (`366:15583`, `441:12029`)

`Overview → View All` opens dedicated holdings page:
- `Go back`
- Heading: **All Assets**
- Subtitle: *See all your owned assets below*
- **Filter** button
- Full grid of holdings (Azure, Vela, Coastal, Metropolitan, Shanti Palazo, Condo Al Cartie, …)
- Click card → either Asset Detail (Explore) or Trading view — design intent ambiguous; spec **Trading** for owned assets (faster path to sell).
