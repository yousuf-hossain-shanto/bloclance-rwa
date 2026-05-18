# API Surface

Implied endpoints from screen requirements. REST sketch (swap to GraphQL/tRPC per team preference).

## Auth

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/email/start` | Request OTP / magic link. Body: `{ email }`. |
| POST | `/auth/email/verify` | Complete sign-in. Body: `{ email, code }` or `{ token }`. Returns session. |
| POST | `/auth/logout` | Invalidate session. |
| GET  | `/auth/me` | Current user. Returns User + KYC status. |

## Profile

| Method | Path | Purpose |
|---|---|---|
| GET    | `/me` | Profile detail incl. wallets + KYC. |
| PATCH  | `/me` | Update displayName, avatar. |
| POST   | `/me/avatar` | Upload profile picture. |
| POST   | `/kyc/start` | Begin KYC, returns provider URL/token. |
| POST   | `/kyc/webhook` | Provider → backend status updates. |

## Properties (Explore + Marketplace)

| Method | Path | Purpose |
|---|---|---|
| GET | `/properties` | List. Query: `sort=highestRoi|newest`, `page`, `pageSize`, `priceMin`, `priceMax`, `yieldMin`, `yieldMax`, `location`. |
| GET | `/properties/:id` | Detail incl. description, financials, documents, image gallery. |
| GET | `/properties/:id/market` | Trading-view payload: last price, volume, valuation, available units, deltas. |
| GET | `/properties/:id/book` | Order book snapshot. Query `side=buy|sell`. |
| GET | `/properties/:id/candles` | Chart data. Query `interval=1d`, `range=3M|6M|1Y|All`, `axis=price|yield`. |
| GET | `/properties/:id/trades` | Recent trade history. |

## Portfolio

| Method | Path | Purpose |
|---|---|---|
| GET | `/portfolio/overview` | KPIs: portfolioValue, walletValue (XRP + RLUSD breakdown), assetsOwnedCount, valueSeries. |
| GET | `/portfolio/holdings` | List user holdings (joined with property summary). Query `page`, `pageSize`, filter params. |
| GET | `/portfolio/value-series` | Portfolio value over time. Query `range=All|3M|6M|1Y`. |

## Primary purchase

| Method | Path | Purpose |
|---|---|---|
| POST | `/purchases/preview` | Body: `{ propertyId, units, asset }`. Returns total, fees, balance check. |
| POST | `/purchases` | Submit purchase. Body: same + `agreementAccepted: true`. Returns purchase id + status. |
| GET  | `/purchases/:id` | Poll status. |

## Trading

| Method | Path | Purpose |
|---|---|---|
| POST | `/orders/preview` | Body: `{ propertyId, side, type, units, pricePerUnit?, asset }`. Returns total, fees, slippage estimate. |
| POST | `/orders` | Submit order. |
| GET  | `/orders` | List user orders. Query `status=open|filled|all`, `propertyId?`. |
| DELETE | `/orders/:id` | Cancel open order. |
| GET | `/orders/:id` | Detail. |

## Withdrawals

| Method | Path | Purpose |
|---|---|---|
| POST | `/withdrawals/preview` | Body: `{ asset, amount, destinationAddress }`. Returns fee, total, validation. |
| POST | `/withdrawals` | Submit withdrawal. |
| GET  | `/withdrawals` | History. |
| GET  | `/withdrawals/:id` | Detail + tx hash. |

## Wallets

| Method | Path | Purpose |
|---|---|---|
| GET | `/wallets` | Per-asset balances (XRP, RLUSD) + USD equivalents + the user's deposit address. |
| GET | `/wallets/deposit-address` | Address for funding. Same r-address; UI may show two entries for clarity. |

## Realtime

WebSocket / SSE channel for:
- `orderbook:<propertyId>` — live book updates
- `trades:<propertyId>` — new trades stream
- `prices:<propertyId>` — chart tick
- `user:<userId>:orders` — fills + status changes
- `user:<userId>:withdrawals` — confirmations

## Conventions

- Auth via session cookie (HTTP-only) + CSRF token.
- Decimal fields as strings to avoid JS float loss.
- All amounts in canonical units (XRP in drops? or display? — pick **display string with explicit asset**: `{ asset: "XRP", amount: "658.25" }`).
- Pagination: `{ page, pageSize, total }` envelope.
- Errors: `{ code, message, fields?: { fieldName: message } }`.
