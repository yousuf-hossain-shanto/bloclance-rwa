# Marketplace

Secondary-market trading listing. Auth required (UI shows wallet pill in all variants).

Variants: `340:7243`, `343:7569`, `433:7414`, `429:1080`, `350:14266`, `365:14648` (with wallet dropdown open).

## Layout

```
[Top nav with wallet pill]
[Page title + subtitle]
[Counter | Filter button]
[Property grid — trading variant]
[Pagination]
[Disclaimer + footer]
```

## Header

- Title: **Marketplace**
- Subtitle: *Trade fractional real estate shares.*
- Counter: **35 Properties Available**
- Right: **Filter** button (icon + label)

## Property card (trading variant)

Differs from Explore card — emphasizes liquidity/volume.

| Field | Example |
|---|---|
| Hero image | property photo |
| Name | The Azure Penthouse |
| Location | Miami, Florida |
| ROI badge | 11.2% ROI |
| Total trade volume | $12,587,971 |
| Price per unit | $430 |
| Total units | 428,587 |

### Catalog (from designs)

| Property | Location | ROI | Volume | Price/unit | Total units |
|---|---|---|---|---|---|
| The Azure Penthouse | Miami, Florida | 11.2% | $12,587,971 | $430 | 428,587 |
| Vela Commercial Tower | Austin, Texas | 8.4% | $256,879 | $130 | 36,433 |
| Coastal Retreat Villa | Malibu, California | 14.2% | $1,981,201 | $200 | 69,037 |
| Metropolitan Lofts | New Jersey, New York | 9.8% | $568,713 | $1,500 | 147,522 |
| Pasuma Penthouse | Houston, Texas | 2.5% | $2,587,100 | $205 | 28,187 |
| Ma Shalla Apartments | Monte Carlo, Monaco | 13.6% | $901,300 | $50 | 781,203 |
| Duchess L' Crib | Madrid, Spain | 12% | $60,000,120 | $100 | 12,587,147 |
| Eye Pearl Condo | Bali, Indonesia | 6% | $421,387 | $300 | 32,097 |

## Filter

Button visible but criteria not exposed in the captured frames. From design system component naming, expected filter dimensions:
- Unit Price Range
- Average Yield Range
- (Likely also: Location, Property type, Hold period)

## Pagination

Same control as Explore: `Showing 1-4 of 24 results`, numbered 1-10 with ellipsis, Rows per page selector (default `2`).

## Click target

Clicking a card navigates to **Market Order / Limit Order** trading view — see [trading.md](trading.md).

## Wallet dropdown (variant `365:14648`)

Opening the wallet pill reveals:
- `XRP Wallet` + address (Copy)
- `RLUSD Wallet` + address (Copy)
- `Wallet` section divider
- `My Profile`
- `Not Verified` pill
- `Sign Out`
