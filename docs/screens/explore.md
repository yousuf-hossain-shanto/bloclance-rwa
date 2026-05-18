# Explore

Public catalog of investable properties + asset detail page. Accessible without auth.

## Explore listing

Variants: `319:1980` (unauth canonical), `334:3168`, `374:18982`, `407:22343`, `407:19565` (unauth alternates), `334:3431` (auth).

### Header

- Hero title: **Explore Available Properties**
- Subtitle: *Browse curated properties and invest in seconds. Every asset on SurgeXRP is selected for stable rental yield and consistent income.*

### Sort / filter row

- Label: `SORT BY:`
- Pill toggles: **Highest ROI** (default active), **Newest**

### Asset grid

Card per property. 8 cards visible in the page-1 view (4×2 implied). Each card shows:

| Field | Example |
|---|---|
| Image (hero) | property photo |
| Name | The Azure Penthouse |
| Location (with map-pin icon) | Miami, Florida |
| ROI badge (gold) | 11.2% ROI |
| Price per unit | $430 |
| Units available / total | 400 / 1,200 |

#### Catalog from designs (page 1)

| Property | Location | ROI | Price/unit | Units avail | Total units |
|---|---|---|---|---|---|
| The Azure Penthouse | Miami, Florida | 11.2% | $430 | 400 | 1,200 |
| Vela Commercial Tower | Austin, Texas | 8.4% | $130 | 810 | 2,400 |
| Coastal Retreat Villa | Malibu, California | 14.2% | $200 | 698 | 8,000 |
| Metropolitan Lofts | New Jersey, New York | 9.8% | $1,500 | 205 | 12,000 |
| Pasuma Penthouse | Houston, Texas | 2.5% | $205 | 65 | 3,800 |
| Ma Shalla Apartments | Monte Carlo, Monaco | 13.6% | $50 | 1,800 | 2,000 |
| Duchess L' Crib | Madrid, Spain | 12% | $100 | 32,000 | 50,000 |
| Eye Pearl Condo | Bali, Indonesia | 6% | $300 | 66,250 | 89,000 |
| Shanti Palazo | Chicago, Illinois | 12% | $100 | 32,000 | 50,000 |
| Condo Al Cartie | South Carolina, Tennessee | 6% | $300 | 66,250 | 89,000 |

### Pagination

- Footer text: `Showing 1-4 of 24 results`
- Numbered: `1`, `2`, `3`, `...`, `8`, `9`, `10`
- `Rows per page`: `2` (configurable)

### Empty / loading / error

Not present in designs. Specs:
- Loading: skeleton cards (8 placeholders matching grid).
- Empty: copy TBD.
- Error: copy TBD.

## Unauthenticated variants

Multiple Explore unauth frames (`334:3168`, `374:18982`, `407:22343`, `407:19565`) — likely capture hover states, sort toggles, scroll positions. Same content otherwise.

## Authenticated variant (`334:3431`)

Identical layout. Top-right replaces `Log in / Sign Up` with wallet pill `r62UiV...HfFA` + dropdown — see [shell.md](shell.md).

## See also
- Asset detail → [explore.md#asset-detail](#asset-detail) below
- Marketplace trading view → [marketplace.md](marketplace.md)

---

## Asset detail

Variants: `329:2064` (unauth), `338:6462` (unauth + auth modal), `338:6579` (auth), `441:11859` (auth purchase context).

Path: `Explore → click card → Asset Detail`.

### Layout

```
[Go back]
[Hero image — large]
[Title block: Name, Location pin]      [Right column: pricing card]
[Property value | Hold period]
[Price per unit | Units available | ROI badge]
[Units input + Invest now button]
[Minimum investment notice]
[Tabs: About Property | Financials | Documents | Order Book]
[Selected tab body]
[Footer]
```

### Header content

- Title: **The Azure Penthouse**
- Location: **Miami, Florida** (with map-pin)
- Property value: **$2,581,023**
- Hold period: **3-5 Years** (label inconsistency in mocks: one says *Holding period*, others say *Hold period* — pick **Hold period** for consistency)
- Price per unit: **$430** (or `$430.00` in some mocks)
- Units available: **400 / 1200** (one mock uses `/1,200`)
- ROI badge: **11.2% ROI** (gold)
- Quantity stepper: starts at `1`
- Primary CTA: **Invest now**
- Notice: *Minimum investment is **$1,000 (5 Units)***

### Tabs

1. **About Property** (default active) — bedroom count, area, description, developer.
   - Bedroom: **4**
   - Area Space: **727 sqm**
   - Property Description: *"Perched atop the city's skyline, The Azure Penthouse is a masterclass in coastal modernism and elevated living. Designed for those who demand both high-octane energy and serene privacy, this residence offers an unparalleled vantage point over the shimmering Biscayne Bay and the Atlantic horizon."*
   - Developer: **The Azure Homes and Suites**
2. **Financials** — content not present in current Figma export. Spec: ROI breakdown, yield distribution schedule, fees.
3. **Documents** — content not present. Spec: legal docs, prospectus, title deeds (PDF links).
4. **Order Book** — content not present here (live order book is on trading screen). Spec: primary-issuance subscription list or redirect to secondary marketplace.

### Unauth → auth gate

Clicking **Invest now** when unauth opens the Auth modal (`338:6462`). On success, returns to same detail with the Purchase modal opened (`441:11859`).

### Purchase trigger

Auth + click **Invest now** opens Purchase modal — see [purchase.md](purchase.md).
