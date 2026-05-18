# Purchase Asset Units

Modal for **primary-issuance** purchase (buying units directly from the offering). Triggered by `Invest now` on Asset Detail.

Variants: `339:6699` (XRP, valid), `339:7060` (RLUSD, valid), `339:6883` (XRP, insufficient funds).

## Layout

Modal/drawer over Asset Detail. Title block:
- Heading: **Purchase shares for**
- Property name: **The Azure Penthouse**
- ROI badge: **11.2% ROI**

## Fields

| Field | Notes |
|---|---|
| **Units to buy** | Numeric stepper. Sample `300`. |
| **Price per unit** | Read-only, sample `$430`. |
| **Total** | Auto-calc (units × price). Sample `$368,258`. |
| **Available balance** | From selected wallet. Varies: `$2,581,023` (valid), `$32,589` (insufficient). |
| **Select Asset** | Dropdown: `XRP` or `RLUSD`. |
| **Purchase Now** | Primary button. Disabled when funds insufficient. |

Footer (always): *"By confirming, you agree to the offering terms and agreement"*

## State: insufficient funds (`339:6883`)

- Red inline text: **Oops! insufficient funds**
- Secondary action: **Fund Wallet** (gold link, takes user to Profile → Surge Wallets).
- `Purchase Now` button visually disabled.

## Validation

- Units to buy ≥ minimum investment unit count. Asset Detail specifies minimum **$1,000 / 5 Units** — enforce client-side based on selected property's price/unit.
- Units to buy ≤ available units (from asset).
- Total ≤ Available balance (in selected asset, after price conversion).

## Behavior on submit

Designs don't show post-submit. Spec:
1. Disable form, spinner on button.
2. On success: success card with units allocated + txn hash + "View in Portfolio" link.
3. On failure: error banner with retry.
4. KYC gate: if user is **Not Verified**, redirect to Profile → Verify before allowing submit.

## Differences vs secondary-market trading

This is **primary issuance** — buying units that haven't been sold yet. Differs from **Trading** (secondary marketplace):

| | Purchase (primary) | Trading (secondary) |
|---|---|---|
| Counterparty | The offering / issuer | Another user |
| Price | Fixed (Price per unit) | Market/Limit |
| Order book | N/A | Yes |
| Settlement | Tokens minted to buyer | Tokens transferred peer-to-peer |
| Min investment | Yes ($1,000 / 5 units) | Likely none (or smaller) |
