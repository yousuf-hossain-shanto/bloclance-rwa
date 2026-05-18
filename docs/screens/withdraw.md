# Withdraw Earnings

Modal triggered from Overview header CTA. 7 mocked states cover the form lifecycle.

Variants: `438:8146` (empty), `441:9941` (XRP filled), `441:10760` (RLUSD filled), `441:11606` (RLUSD over-balance error), `441:10489` (XRP at max), `441:11028` (RLUSD filled alt), `441:10209` (XRP over-balance error).

## Layout

Right-side drawer / centered modal over Overview dashboard. Title in card:
- **Withdraw Earnings**
- Subtitle: *Enter your withdrawal details below*

## Fields

| # | Field | Notes |
|---|---|---|
| 1 | **Select Asset** | Dropdown: `XRP` or `RLUSD`. Empty state shows `Choose asset`. |
| 2 | **Available balance** | Read-only, mirrors selected asset. XRP shows `38,202.40 XRP ($55,000)`. RLUSD shows `$103,368`. Empty state shows `-`. |
| 3 | **Wallet Address** | Destination address input. Sample: `r62UiV223536746446892HfFA` (full XRPL address). |
| 4 | **Enter Amount** | Numeric input with asset unit suffix (`XRP` or `RLUSD`). Has `Max.` shortcut button. |
| 5 | **USD Equivalent** (XRP only) | Read-only conversion, e.g. `$963.95`. RLUSD form omits this row (RLUSD ≈ USD). |
| 6 | **Total withdrawal** | Summary row above CTA. Mirrors entered amount with unit, e.g. `658.25 XRP` or `$55,123`. |
| 7 | **Withdraw Earning** | Primary action button (gold, full-width). |

## State matrix

| State | Asset | Amount | Validation | Submit enabled |
|---|---|---|---|---|
| Empty | unselected | empty | hidden | no |
| Valid XRP | XRP | ≤ balance | none | yes |
| Valid RLUSD | RLUSD | ≤ balance | none | yes |
| Max XRP | XRP | = full balance (Max.) | none | yes |
| Over-balance XRP | XRP | > balance | red text: *"Amount is insufficient. Enter amount in your wallet"* | no |
| Over-balance RLUSD | RLUSD | > balance | same error | no |

(Loading + success + failure states not in current export — spec them: spinner on button, success "Withdrawal submitted, txn hash: [link]", failure with retry.)

## Validation rules

- Amount must be > 0.
- Amount must be ≤ Available balance.
- Wallet Address must be a valid XRPL r-address (regex `^r[1-9A-HJ-NP-Za-km-z]{24,34}$`).
- For XRP destination tags: not visible in mocks — add field optionally per XRPL best practice.

## Behavior on submit

Designs don't show post-submit screen. Spec:
1. Disable form, show inline spinner on `Withdraw Earning` button.
2. On success: render a success state with txn hash + explorer link, plus "Done" / "Make another withdrawal" actions.
3. On failure: show error banner with retry.
4. Update wallet balances optimistically once tx is validated by XRPL.

## Open questions

- Single withdrawal flow for both XRP and RLUSD, or split? Mocks unify under one modal — proceed unified.
- Fee preview missing. XRPL fees are negligible but should be shown above Total.
- Memo / destination tag? Not in current designs — recommend adding to support exchange withdrawals.
