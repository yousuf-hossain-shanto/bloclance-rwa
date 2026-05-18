# Data Model

Entities derived from Figma screens.

## User

```ts
User {
  id: UUID
  email: string
  displayName: string | null
  avatarUrl: string | null
  kycStatus: 'NotVerified' | 'Pending' | 'Verified'
  kycProviderRef: string | null
  xrpAddress: string         // r-address — same account holds RLUSD trustline
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Wallet view (derived)

Mocks show two wallets per user — but same address. So no `Wallet` table is strictly needed; instead a view per asset:

```ts
WalletBalance {
  userId: UUID
  asset: 'XRP' | 'RLUSD'
  balance: Decimal             // native units (XRP drops or RLUSD)
  usdEquivalent: Decimal       // server-derived using oracle
}
```

## Property (RWA listing)

```ts
Property {
  id: UUID
  name: string                  // e.g. "The Azure Penthouse"
  locationCity: string
  locationRegion: string
  heroImageUrl: string
  galleryUrls: string[]
  description: string
  developer: string
  propertyValue: Decimal        // appraisal e.g. $2,581,023
  holdPeriod: string            // "3-5 Years"
  bedroomCount: int | null
  areaSqm: int | null
  pricePerUnit: Decimal         // primary issuance price
  totalUnits: int               // e.g. 1200
  unitsAvailable: int           // remaining for primary purchase
  roiAnnualPct: Decimal         // e.g. 11.2
  minInvestmentUsd: Decimal     // default $1,000
  minInvestmentUnits: int       // default 5
  status: 'Active' | 'SoldOut' | 'Closed'
  documentsUrls: string[]       // legal docs for Documents tab
  financials: JSON              // yield breakdown, fees — TBD shape
  createdAt: DateTime
  tokenIssuerAddress: string    // XRPL issuer account for this property's token
  tokenCode: string             // 3-char or 40-char hex currency code on XRPL
}
```

## Holding

```ts
Holding {
  userId: UUID
  propertyId: UUID
  unitsOwned: int
  averageCostPerUnit: Decimal   // for P&L computation
  acquiredAt: DateTime          // first acquisition
}
```

Aggregate per user → portfolio.

## Order (secondary trading)

```ts
Order {
  id: UUID
  userId: UUID
  propertyId: UUID
  side: 'Buy' | 'Sell'
  type: 'Market' | 'Limit'
  units: int
  pricePerUnit: Decimal | null  // null for market; set for limit
  settlementAsset: 'XRP' | 'RLUSD'
  totalAmount: Decimal          // payable (buy) or receivable (sell)
  status: 'Open' | 'PartiallyFilled' | 'Filled' | 'Cancelled' | 'Expired' | 'Failed'
  filledUnits: int
  averageFillPrice: Decimal | null
  createdAt: DateTime
  filledAt: DateTime | null
  xrplTxHashes: string[]        // on-chain settlement txs
}
```

## Trade (executed match)

```ts
Trade {
  id: UUID
  propertyId: UUID
  buyOrderId: UUID
  sellOrderId: UUID
  units: int
  pricePerUnit: Decimal
  settlementAsset: 'XRP' | 'RLUSD'
  buyerUserId: UUID
  sellerUserId: UUID
  xrplTxHash: string
  occurredAt: DateTime
}
```

Powers Trade History tab + chart price points.

## Primary purchase (issuance)

```ts
PrimaryPurchase {
  id: UUID
  userId: UUID
  propertyId: UUID
  units: int
  pricePerUnit: Decimal         // snapshot at purchase time
  totalAmount: Decimal
  settlementAsset: 'XRP' | 'RLUSD'
  status: 'Pending' | 'Confirmed' | 'Failed'
  xrplTxHash: string | null
  agreementSignedAt: DateTime   // "By confirming, you agree to the offering terms"
  createdAt: DateTime
}
```

## Withdrawal

```ts
Withdrawal {
  id: UUID
  userId: UUID
  asset: 'XRP' | 'RLUSD'
  amount: Decimal               // native asset units
  destinationAddress: string    // user-entered r-address
  destinationTag: int | null    // recommend collecting; not in current mocks
  status: 'Pending' | 'Submitted' | 'Confirmed' | 'Failed'
  xrplTxHash: string | null
  createdAt: DateTime
  confirmedAt: DateTime | null
}
```

## Yield distribution (not in mocks — propose)

Rental income must reach users somehow. Propose:

```ts
YieldDistribution {
  id: UUID
  propertyId: UUID
  periodStart: Date
  periodEnd: Date
  totalAmount: Decimal
  settlementAsset: 'RLUSD'      // most likely USD-pegged
  distributedAt: DateTime
}

YieldPayout {
  id: UUID
  userId: UUID
  propertyId: UUID
  distributionId: UUID
  units: int                    // user's units at snapshot
  amount: Decimal
  xrplTxHash: string
}
```

Drives the `Withdraw Earnings` feature — payouts accumulate in wallet balance, withdrawable to external address.

## Chart / market data (cached / derived)

- `OrderBookSnapshot` — periodic snapshots for the order book widget.
- `PriceCandle` — OHLC bars per property × interval (used by chart).
- `YieldHistory` — for Yield axis on chart.

## Reference data

- `SupportedAsset` — XRP, RLUSD (currency code + issuer for RLUSD).
- `LegalDocument` — disclaimer copy, ToS, agreement.
