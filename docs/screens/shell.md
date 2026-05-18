# App Shell

Persistent across all screens.

## Top nav

Layout: row, left-aligned logo (implied — not present in text dump but is a visual element), centered/right tabs, right-aligned auth widget.

### Tabs (always visible)
- **Overview**
- **Explore**
- **Marketplace**

Active tab uses gold accent color.

### Right-side widget

**Unauthenticated**:
- `Log in` (ghost button)
- `Sign Up` (primary gold button)

**Authenticated**:
- Truncated wallet address pill, e.g. `r62UiV...HfFA` (one mock shows `0x9e...E889` — likely placeholder, the canonical XRPL format is `r...`).
- Caret-down opens dropdown menu:
  - `XRP Wallet` `r62UiV...HfFA`
  - `RLUSD Wallet` `r62UiV...HfFA`
  - `Wallet` section header
  - `My Profile`
  - `Not Verified` / `Verified` KYC pill
  - `Sign Out`

Dropdown source: marketplace variant `365:14648`.

## Footer

Disclaimer block:
> **Disclaimer:** SurgeXRP is a technology platform for tokenized real-world assets. Nothing on this website is financial, legal, tax, or investment advice, or an offer to buy or sell any asset or security. Investing involves risk, including loss of capital. Access may be subject to eligibility and applicable regulations.

Link: `Read Full Legal Disclaimer`

Copyright: `2026 SurgeXRP. All rights reserved.`

Social icons present in components: Telegram (`Logos / telegram-fill`), Email.

## Go back

Sub-page screens (Asset Detail, Trading, Withdraw, etc.) show a left-aligned `Go back` link below nav.

## Common modals

- Auth modal (see [auth.md](auth.md))
- Withdraw Earnings modal (see [withdraw.md](withdraw.md))
- Purchase modal (see [purchase.md](purchase.md))
- Confirm Order modal (see [trading.md](trading.md))

## Canvas

Designs are 1440px wide (web-first). Dark theme throughout — see [design/tokens.md](../design/tokens.md).
