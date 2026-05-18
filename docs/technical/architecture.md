# Architecture

Decisions confirmed 2026-05-18 — see [open-questions.md](../open-questions.md) for rationale per pick.

## High-level

```
┌────────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Web app (Next.js) │ ←→ │  API (BFF)       │ ←→ │  PostgreSQL      │
└────────┬───────────┘    └─────┬────────────┘    └──────────────────┘
         │                       │
         │                       ├─→ XRPL nodes (Mainnet + Testnet)
         │                       │     • OfferCreate / OfferCancel
         │                       │     • Payment (settlement, yield drip)
         │                       │     • TrustSet / MPTokenAuthorize (auth lines)
         │                       │
         │                       ├─→ Clio indexer (read-only XRPL queries)
         │                       ├─→ Privy / Web3Auth (embedded wallets)
         │                       ├─→ Sumsub (KYC)
         │                       ├─→ Stytch (email OTP auth)
         │                       ├─→ ComplyAdvantage / Chainalysis (sanctions, KYT)
         │                       └─→ Postmark / SES (transactional email)
         │
         └─→ Privy / Web3Auth SDK for signing prompts
```

## Settlement layer: XRPL

- **Assets**: each tokenized property = issued token on XRPL.
  - **Preferred**: MPT (XLS-33) with `lsfMPTRequireAuth` + `lsfMPTCanTransfer`, optional `TransferFee`.
  - **Fallback** (if MPT not on mainnet at build start): issued-currency token + `RequireAuth` on issuer + per-holder trustlines.
- **Settlement currencies**: native **XRP** and **RLUSD** (Ripple stablecoin).
- **Primary issuance** (Purchase Asset Units): direct mint/transfer from issuer to buyer wallet, paid in XRP/RLUSD.
- **Secondary trading**: **native XRPL DEX**.
  - **Market order** = `OfferCreate` with `tfImmediateOrCancel` (or `tfFillOrKill`).
  - **Limit order** = standard `OfferCreate`; rests in ledger directory until filled, cancelled, or `Expiration` reached.
  - **Order book** UI = `book_offers` RPC + `subscribe books` stream.
  - **Trade history / chart** = `subscribe transactions` filtered by issuer; aggregate OHLCV in Clio + our indexer.
  - **Settlement** = counterparty RippleState (trustline) balance flips on tx success.
- **Compliance levers** (issuer-side, not custodial):
  - `RequireAuth` on issuer account → only authorized r-addresses can hold the property token.
  - On KYC pass, issuer signs `MPTokenAuthorize` (or `TrustSet` with `tfSetfAuth`) for that holder.
  - `FreezeEnabled` for court-ordered freezes; global freeze for full halts.
- **Reserve management**:
  - Sponsor user account base reserve (2 XRP) + per-object reserves (0.2 XRP per trustline/offer) at onboarding.
  - Set `Expiration` on limit offers so stale orders auto-clean (releases reserve).

## Frontend

- **Framework**: Next.js (App Router) + React.
- **Styling**: CSS variables (token file mirrors `design/tokens.md`) + Tailwind. Glassmorphism via `backdrop-filter`.
- **Charts**: Lightweight Charts (TradingView) for the trading view; Recharts for portfolio.
- **State**: React Query (server cache) + Zustand (UI state).
- **Wallet integration**: Privy SDK or Web3Auth (XRPL adapter) — embedded non-custodial wallet, email login, MPC keyshares. App never holds the full key.
- **Signing UX**: app builds txn JSON server-side → embedded-wallet SDK signs → submits to `rippled` → app polls + indexer reconciles.

## Backend

- **Framework**: NestJS (Node) — TypeScript end-to-end, matches frontend stack.
- **Database**: PostgreSQL — users, properties, holdings (cached/indexed), orders (off-chain reference; book lives on XRPL), trades, withdrawals, KYC records, yield distributions.
- **Cache**: Redis — order-book snapshots, session, rate limits.
- **Queue**: BullMQ (Redis) — KYC callbacks, yield distribution batches, settlement confirmations, sanctions refresh.
- **Realtime**: WebSocket (Socket.IO or native ws) for order-book + chart streams; backed by XRPL `subscribe`.
- **Indexer**: dedicated worker consuming XRPL `transactions` + `books` streams → Postgres for charts, history, tax lots, holder snapshots.

## Auth

- **Mechanism**: passwordless email **6-digit OTP** via **Stytch**.
  - 6 digits numeric, 10-min TTL, single-use.
  - Rate limit: 3 sends per email per 15 min; 5 verify attempts per code; 10 verifies per IP per hour; 30-min lockout after 5 fails.
  - Constant-time comparison; invalidate code after 3 wrong attempts.
- **Session**: HTTP-only cookie (Secure, SameSite=Lax), 24h sliding refresh.
- **Anti-bot**: Cloudflare Turnstile invisible challenge on Continue.
- **Email**: Postmark on dedicated subdomain `auth.surgexrp.com` with SPF/DKIM/DMARC.
- **Step-up auth**: passkey / device biometric required before purchases >$10k and any withdrawal (add to designs — not in current Figma).
- **Wallet linking**: on first OTP verify, Privy / Web3Auth creates the user's embedded XRPL wallet bound to their email; r-address persisted to `users.xrp_address`.

## Wallet model

- **Embedded non-custodial** (Privy or Web3Auth with XRPL adapter).
- User signs in with email; provider creates the wallet via MPC keyshares; SurgeXRP never has the full key.
- Single XRPL r-address holds XRP balance natively and RLUSD as an issued-currency balance via trustline. UI shows "XRP Wallet" and "RLUSD Wallet" as two views over the same address.
- Withdrawals = embedded wallet signs a `Payment` from the user's r-address to the destination they enter.
- Recovery via Privy/Web3Auth's social + passkey + Shamir share mechanisms.
- **Fallback**: if legal classifies embedded wallets as custody in our jurisdictions, escalate to Fireblocks MPC custodial. Same Figma UX; much higher compliance cost.

## KYC

- **Provider**: Sumsub (best RWA/crypto coverage, Travel Rule built-in). Persona as US-polish fallback.
- **Trigger policy** (hybrid — see Q5 in open-questions):
  - Sign-up: email + sanctions/PEP/IP/device screen via ComplyAdvantage. Cheap, runs in background.
  - Browse (Explore, Marketplace listing, asset detail, charts, watchlist): open, no KYC.
  - First Buy / Sell / Withdraw / token-hold: KYC modal (ID + selfie + address proof) gates the action. Cannot pass without `Verified`.
- **Re-verification**: every 24 months, on material change (name, address, jurisdiction), or single transaction >$10k.
- **Sanctions list refresh**: daily cron; auto-freeze on hit; compliance review within 24h.
- **Jurisdiction gating**: geo-IP + declared residence; block-list shown early in onboarding, not after KYC submission.
- **On verify**: webhook flips `users.kyc_status=verified` → backend signs `MPTokenAuthorize` (or `TrustSet` `tfSetfAuth`) so the user's r-address can hold property tokens.

## Yield distribution

- **Model**: auto-drip — see Q3 in open-questions.
- **Cadence**: monthly (configurable per property).
- **Snapshot**: ledger-index-based, replayable, auditable. Persisted to Postgres as `(property_id, period_id, ledger_index, holder_address, units, pro_rata_bps)`.
- **Calculation**: `payout_i = net_rental_pool * (units_i / total_units)`; round down to RLUSD drops; dust <$0.01 rolls forward.
- **Execution**: `DistributionEngine` computes, `PayoutWorker` batches ~50 `Payment` txns/batch with `LastLedgerSequence` guard. Each txn carries a `Memo` with `period_id + holder_idx` for idempotency.
- **Idempotency**: `(period_id, holder_address) -> tx_hash` table; retries check status before resubmit.
- **Reconciliation**: nightly job — sum of confirmed payouts vs net pool; freeze + page on-call if mismatch.
- **Opt-in Auto-Reinvest** toggle in Profile/Settings: distributions routed into a buy-order queue for the same property. Default off.
- **Dormancy**: 3-year inactivity escheat policy in T&Cs (separate from dust).

## Hosting

- Frontend: Vercel.
- API: Fly.io / Render / AWS ECS.
- DB: managed Postgres (Neon, Supabase, RDS).
- Redis: Upstash or managed.
- XRPL nodes: public clusters (`xrplcluster.com`) for reads; trusted endpoint or self-hosted `rippled` + Clio for writes/indexing.

## Remaining open items

- MPT (XLS-33) mainnet readiness at build start. If not ready, use issued-currency + RequireAuth fallback (same compliance model).
- Embedded-wallet classification per jurisdiction — confirm with legal before locking out custodial fallback.
- Step-up auth (passkey/biometric) screens not in current Figma; design alongside withdrawal + high-value purchase flows.
