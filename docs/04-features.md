# Features

## Auth
- Email-based login/sign-up modal (no password field visible — likely magic link or OTP).
- "By clicking on continue, you agree to our **user terms** and **agreement**."

## Explore (public)
- Sortable property grid (Highest ROI default, Newest).
- Property cards: image, name, location, ROI badge, price/unit, units available/total.
- Pagination: 10 pages, "Showing 1-4 of 24 results", configurable rows per page.
- Asset detail page with hero image, specs, About/Financials/Documents/Order Book tabs.
- Property specs: property value, hold period, bedrooms, area (sqm), description, developer.
- Minimum investment notice: *"Minimum investment is **$1,000 (5 Units)**"*.

## Marketplace (auth)
- 35 properties listed with trade volume, ROI, price/unit, total units.
- Filter button (criteria TBD; design system hints "Unit Price Range", "Average Yield Range").
- Same pagination as Explore.

## Trading (auth)
- **Market Order** — choose units, see Market Price + Total Payable, pick XRP/RLUSD, Buy/Sell.
- **Limit Order** — set Price per Unit + units, see Limit Price + Total Payable (or Total Receivable when selling).
- **Order book** — Buy / Sell columns with price + units pairs.
- **Chart** — Price/Yield toggle, timeframes (All / 3M / 6M / 1Y), hover tooltip with date + value + units.
- **Asset header** — name, location, Active status pill, last traded price + delta, total units sold, trade volume + delta, valuation.
- **Confirm Order modal** — order type, units, price/unit, settlement asset, total, "asset right will be transferred once trade is matched".

## Portfolio Overview (auth)
- KPIs: Portfolio Value, Total Wallet Value, RWA Assets Owned count.
- Wallet split: XRP balance (with USD equiv) + RLUSD balance.
- Time-range tabs on chart: All / 3M / 6M / 1Y.
- Asset holdings list with unit value + units owned.
- "View All" → filtered all-assets list (with Filter button).
- Empty state: *"No assets in your portfolio"* + zeroed KPIs.
- Unauthenticated state: marketing copy + Log in / Sign Up.

## Withdraw Earnings (auth)
Multi-state modal:
1. Empty form (no asset, no amount).
2. XRP selected, amount entered, USD equivalent shown.
3. RLUSD selected, amount entered.
4. Amount exceeds balance → red error: *"Amount is insufficient. Enter amount in your wallet."*
5. Max-balance entered (Max. shortcut).
Fields: Select Asset (XRP/RLUSD), Wallet Address (destination), Enter Amount + Max., USD Equivalent (XRP only), Total withdrawal preview.

## Purchase Asset Units (auth, primary issuance)
- Modal "Purchase shares for [Property]".
- Units to buy, Price per unit, Total auto-calc.
- Available balance + Select Asset (XRP/RLUSD).
- Validation: *"Oops! insufficient funds"* with **Fund Wallet** CTA.
- Footer: *"By confirming, you agree to the offering terms and agreement."*

## Profile (auth)
- Profile picture (Change Profile Picture).
- Display Name input.
- Email Address (read-only — populated from auth).
- Your Surge Wallets section: XRP Wallet (copy), RLUSD Wallet (copy).
- "Fund wallet with local currency is coming soon" banner.
- Human Verification (KYC): Not Verified / Verified states + Verify CTA.

## Cross-cutting
- Footer disclaimer on every page (verbatim in [overview](01-overview.md)).
- Social links: Telegram (icon present), Email.
- Copyright: *2026 SurgeXRP. All rights reserved.*
