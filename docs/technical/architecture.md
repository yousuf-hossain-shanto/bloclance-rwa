# Architecture

## High-level

```
┌────────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Web app (Next.js) │ ←→ │  API (BFF)       │ ←→ │  PostgreSQL      │
└────────┬───────────┘    └─────┬────────────┘    └──────────────────┘
         │                       │
         │                       ├─→ XRPL nodes (Mainnet + Testnet)
         │                       ├─→ KYC provider (Persona/Sumsub)
         │                       ├─→ Email provider (auth magic link)
         │                       └─→ Custodial wallet service (xumm/crossmark or self-managed)
         │
         └─→ Public XRPL RPC for read-only chain queries (price, balances) [optional]
```

## Settlement layer: XRPL

- **Assets**: each tokenized property = issued token on XRPL (trustline + issuer account, or MPT once available).
- **Settlement currencies**: native **XRP** and **RLUSD** (Ripple stablecoin).
- **Order matching**:
  - Primary issuance (Purchase Asset Units) = direct mint/transfer from issuer to buyer wallet, paid in XRP/RLUSD.
  - Secondary trading (Marketplace) = either:
    - **XRPL DEX** — native on-ledger DEX with `OfferCreate`/`OfferCancel` transactions (cleanest, but UX depends on liquidity), or
    - **Off-chain order book + on-chain settlement** — server-managed book, on-chain settlement when matched (better UX, more complexity).
  - Mocks show order book + market/limit orders + "asset right will be transferred to you once trade is matched" — suggests off-chain book with on-chain settlement, OR XRPL DEX wrapped behind app.

## Frontend

- **Framework**: Next.js (React) — design hints (component-thinking, responsive 1440 canvas) + standard pick for this stack.
- **Styling**: CSS variables (token file mirrors `design/tokens.md`) + Tailwind or vanilla CSS-in-JS. Glassmorphism via `backdrop-filter`.
- **Charts**: Recharts / Lightweight Charts / TradingView lightweight charts for trading view.
- **State**: React Query (server cache) + Zustand/Jotai (UI state) — TBD.
- **Web3**: WalletConnect / Xumm SDK / Crossmark for XRPL wallet connection. App also shows branded "Surge Wallets" — implies a custodial or app-managed wallet model rather than (or in addition to) bring-your-own-wallet.

## Backend

- **Framework**: Node (NestJS/Fastify) or Go — pick based on team.
- **Database**: PostgreSQL — users, properties, holdings, orders, transactions.
- **Cache**: Redis — order book, session, rate limits.
- **Queue**: Redis / BullMQ — KYC callbacks, withdrawal processing, settlement confirmations.
- **WebSocket / SSE**: for live order book + chart updates.

## Auth

- Passwordless email-only (from auth modal — single Email Address field).
- Magic link or OTP. Recommend **OTP** (works without email deliverability concerns) or magic link (better UX). TBD.
- Session: HTTP-only cookies + CSRF. Or JWT in localStorage (less safe).
- Wallet linking: on first sign-up, app provisions or links a Surge XRP Wallet + Surge RLUSD Wallet (same `r` address in mocks — likely the same XRPL account holding both, just two trustlines).

## KYC

- Provider: Persona, Sumsub, or Onfido.
- Trigger: `Verify` button on Profile.
- Webhook updates KYC status on user record.
- Gate: withdrawals + (likely) trades above a threshold require `Verified`.

## Wallet model

Mocks show `XRP Wallet` and `RLUSD Wallet` with **same address** (`r62UiV...HfFA`). This is consistent with a single XRPL account holding both XRP balance natively and RLUSD as an issued-currency balance via trustline. UI splits the display per asset for clarity.

Recommended model: **custodial** for v1 (app holds keys, user identifies via email + KYC). Reasoning:
- Mocks show `Surge Wallets` branding, not `Connect Wallet` UX.
- Withdraw flow has `Wallet Address` input for destination — strongly implies app holds the source.
- Simpler UX, fits RWA / compliance posture.

Migration path to non-custodial later via Xumm / Crossmark / Gem Wallet integration.

## Hosting

- Frontend: Vercel.
- API: Fly.io / Render / AWS ECS.
- DB: managed Postgres (Neon, Supabase, RDS).
- XRPL nodes: public clusters (`xrplcluster.com`) for reads; trusted endpoint or self-hosted for writes.

## Open questions

- Native XRPL DEX vs off-chain book? **Pick before sprint 1**, large architecture impact.
- Custodial vs non-custodial wallets? **Mocks favor custodial.**
- KYC threshold rules — what triggers required verification? Define with compliance.
- Yield distribution — how are rental earnings credited? Recurring drip to RLUSD balance? Claimable? Not in current designs.
