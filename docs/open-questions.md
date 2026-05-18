# Open Questions

Architectural questions left unresolved by Figma designs. Each has options, a suggested pick, and the reasoning. Living document — update as team discusses.

---

## Q1 — Order book: XRPL native DEX vs off-chain book

**Question**: Where does secondary-market matching happen? On XRPL itself, or in our backend?

### Option A — Native XRPL DEX
Use `OfferCreate` / `OfferCancel` on-ledger. Matching, partial fills, and settlement all happen at protocol level. We just submit signed txns and index the result.

- 3–4s ledger close = settlement.
- Autobridging gives free XRP ↔ RLUSD pathfinding.
- Compliance via MPT `RequireAuth` + `FreezeEnabled` (only KYC'd addresses can custody the property token; issuer can freeze).
- Infra cost: ~$0.00001 per trade. One `rippled` node + Clio indexer.

### Option B — Off-chain order book
SurgeXRP backend runs the matching engine; settlement happens on-chain only when a match occurs (batched Payment txns or XLS-56 Batch).

- Sub-100ms order acks, supports stop/iceberg/post-only.
- Designated market makers can quote tighter (no 2 XRP owner reserve per offer).
- Kill-switch / pause / regulator-halt = one API call.
- Requires ATS license or broker-dealer partner. Infra: Rust engine + Redis + Postgres + multisig hot wallet.

### Suggested pick: **Native XRPL DEX**

Why:
1. Figma copy ("asset right will be transferred to you once trade is matched") **does not require sub-second execution** — 3–4s is fine.
2. **Compliance lever already exists** on XRPL: MPT `RequireAuth` means only KYC-authorized r-addresses can custody the property token. Sanctioned wallets cannot hold it by protocol rule. `FreezeEnabled` handles court orders.
3. **Avoids ATS / exchange licensing** — we stay an issuer, not a venue. Saves ~12 months and $1–3M.
4. **Reserve burden** (2 XRP per resting offer) mitigated by: sponsoring user reserves at onboarding + setting `Expiration` on offers so stale ones self-clean.
5. Migration path is open — build an order-book API our frontend talks to; if v2 needs sub-100ms execution, swap implementation behind same interface.

Caveat: if MPT (XLS-33) isn't on mainnet by build start, fall back to **issued-currency tokens + `RequireAuth` trustlines** — same compliance model, slightly less ergonomic.

---

## Q2 — Wallet model: custodial vs non-custodial

**Question**: Who holds the keys that sign XRPL transactions on behalf of users?

### Option A — Custodial
SurgeXRP holds user keys. Fireblocks MPC (3-of-5) cold + warm + hot tier; omnibus XRPL account with per-user destination tags; insured ($XXM Lloyd's), audited (SOC 2 Type II), monitored (Chainalysis KYT).

- UX = email + KYC, no seed phrase, no wallet popup. Exactly the Figma mocks.
- Can sponsor user reserves, batch ops, recover lost accounts.
- Triggers MTL in ~49 US states + BitLicense (NY) + MiCA CASP (EU) + trust-co rules (SG/HK). 18+ months and $2–5M of compliance work.
- Honeypot risk priced via insurance + PoR + segregated accounts.

### Option B — Non-custodial (raw)
Users connect their own XRPL wallet (Xumm, Crossmark, Gem Wallet). SurgeXRP never holds keys.

- No money-transmitter exposure (in most jurisdictions). No honeypot. No SOC 2 PoR.
- UX hostile for non-crypto retail — seed phrases, signing prompts.
- Withdraw "destination wallet address" field in mocks becomes weird (users withdraw to themselves).

### Option C — Embedded non-custodial (Privy / Web3Auth / Magic / Dynamic with XRPL adapter)
Users sign in with email; provider creates a wallet via MPC keyshares or shard-based key management. The app never reconstructs the full key. **Looks custodial, regulator-classified non-custodial** (FinCEN 2019, recent CFTC posture).

- Email login = Figma UX preserved exactly.
- "Surge Wallets" labels become the user-owned r-address (still shown as one address holding XRP + RLUSD trustline).
- Withdraw flow = user signs a `Payment` from their own r-address via the embedded wallet (transparent).
- Recovery via social/email/passkey + Shamir shares.

### Suggested pick: **Option C — Embedded non-custodial (Privy or Web3Auth XRPL)**

Why:
1. Both opposing agents converged here in their rebuttals — embedded wallets dissolve the custody-vs-UX trilemma.
2. **Skips ~$2–5M + 18mo of licensing** vs Option A.
3. **UX matches Figma exactly** — email auth, branded "Surge Wallet" pill, copy-address, "withdraw to wallet address" all preserved.
4. **Compliance lever moves to the issuer side of XRPL** (RequireAuth + Freeze on the property-token issuer account) — same effective control as custodial without holding user keys.
5. Recovery via Privy/Web3Auth's built-in social + passkey + Shamir mechanisms — no "lost seed phrase = lost money".

Fallback: if legal advises that even MPC embedded wallets count as custody in our target jurisdictions, escalate to **Option A (Fireblocks MPC custodial)** with the same Figma UX.

---

## Q3 — Yield distribution: auto-drip vs claimable

**Question**: How does rental yield (the ROI shown per property) reach users?

### Option A — Auto-drip
At end of each yield period (monthly/quarterly), system snapshots holders, computes pro-rata payouts, sends `Payment` txns to all holders' wallets in RLUSD. Wallet balance increases automatically.

- No claim screen needed. Mocks already match.
- Tax-clean: one distribution date per period, 1099-DIV-style.
- Zero abandoned rewards (industry avg 15–30% claim leakage).
- XRPL fees ~10 drops/payout ≈ cents per 10k recipients.

### Option B — Claimable
Earnings accrue server-side; user sees "Unclaimed earnings: $X" KPI; clicks "Withdraw Earnings" (= claim + withdraw atomic). No auto-push.

- Treasury holds float; at $50M AUM with 30-day claim lag ≈ ~$200k/yr T-bill yield revenue.
- Fewer txns broadcast; lower (already-tiny) fee total.
- KYC/sanctions re-check at claim moment.
- Escheat handling for dormant accounts.

### Suggested pick: **Option A — Auto-drip + optional Auto-Reinvest toggle**

Why:
1. **Mocks have no claim screen.** Claimable adds design work; auto-drip adds none. Withdraw Earnings flow already exists and just drains the accumulated balance.
2. **XRPL fees are genuinely negligible** — the "fee burn" objection imports Ethereum economics that don't apply.
3. **Tax discreteness still works** — one distribution date per period gives clean 1099-DIV. Auto-drip consolidates, doesn't fragment.
4. **Float revenue is real but feels parasitic** for a retail RWA product — earning yield off user rentals between accrual and payout is a soft conflict of interest.
5. **Auto-Reinvest toggle** in Settings: distributions optionally routed into a buy-order queue for the same property (compounding). Default off — user wallet credited.
6. **Dust** under $0.01 rolls forward to next period; no escheat needed for live accounts.
7. Separate **3-year inactivity escheat** policy in T&Cs for genuinely dormant accounts (belt-and-suspenders).

---

## Q4 — Auth: magic link vs email OTP

**Question**: After user submits email, how do they prove ownership?

### Option A — Magic link
Click a link in your inbox to sign in. No code typing.

- One tap, ~95% click-through.
- Universal links handle mobile deep-linking.
- Provider: Stytch / Clerk / Magic / Supabase Auth.

### Option B — 6-digit OTP via email
Type 6 digits from your inbox into the app.

- Cross-device works natively (desktop session, phone reads code).
- No in-app browser breakage (the #1 magic-link failure mode — Gmail/Outlook mobile open links in WebView, consuming the token outside the user's real browser session).
- Retail mental model owned by Robinhood / Coinbase / banks.
- Provider: Stytch / Clerk / Supabase / WorkOS.

### Suggested pick: **Option B — 6-digit email OTP via Stytch**

Why:
1. **In-app browser breakage** is the killer of magic links — silent, opaque failure where token gets consumed in WebView but the user's real Safari/Chrome session never authenticates. Magic link's worst case is "support ticket"; OTP's worst case is "retype 6 digits".
2. **Cross-device is normal** for retail finance users — desktop investor reads OTP on iPhone Mail. Magic link forces device convergence.
3. **Retail trained** on OTP by every fintech they use. No learning curve.
4. Figma single-email-field → Continue is compatible with both; OTP just adds a code-input screen next, which is a familiar pattern.
5. **Step-up auth** (passkey or device-bound biometric) layered on top for high-value RWA actions (purchases >$10k, withdrawals).
6. Provider tuning: 10-min TTL, 6 digits numeric, 3 sends/email/15min, 5 verify attempts/code, 30-min lockout after 5 fails.

---

## Q5 — KYC: required upfront vs threshold-triggered

**Question**: When does a user have to complete identity verification?

### Option A — Upfront
KYC required before any holding, purchase, sale, or withdrawal. Only browsing (Explore, Marketplace listing, asset detail, charts) is open to unverified users.

- Regulator-aligned with securities posture (RWA tokens = securities in most jurisdictions).
- Sanctions screening before any custody.
- Audit trail clean.
- Conversion drop-off concentrated at first transaction (high-intent).

### Option B — Threshold-triggered
Tier 0 (email + sanctions/IP/PEP screen) lets users invest up to $1,000 cumulative without ID/selfie. Tier 1 (full KYC) required for >$1,000 cumulative, any sell, any withdrawal. Tier 2 (source-of-funds) for >$50k.

- Conversion math is much better (40–60% drop-off avoided).
- FATF Recommendation 10 explicitly contemplates threshold-based CDD.
- Compliance focus on engaged users only.
- Risk: securities rules treat *holding* (not just transacting) as the trigger — a $50 investment in an unregistered offering is still an unregistered offering.

### Suggested pick: **Hybrid — open browse, KYC at first Buy / Sell / Withdraw click**

(Both agents converged here — pro-upfront's "gate Buy/Sell/Withdraw" and pro-threshold's "T0 has no transactions" describe the same reconciled flow.)

Why:
1. **Sign-up = email + sanctions/PEP/IP screen** runs in the background. Cheap, continuous, low friction.
2. **Browse is open** — Explore, Marketplace, asset detail, charts, watchlist. No KYC. Captures intent.
3. **First Buy / Sell / Withdraw / hold = KYC modal** (Sumsub: ID + selfie + address + sanctions). Cannot pass without verified.
4. **Skip the $1,000 tier minefield** — defending "why $1,000?" per jurisdiction is open-ended legal exposure. Securities laws care about *holding*, not amount.
5. **Provider: Sumsub** (best RWA/crypto coverage, Travel Rule built-in). Persona as fallback for US polish.
6. **Re-verification: every 24 months**, plus on material change (name, address, jurisdiction) or on any single transaction >$10k.
7. **Daily sanctions list refresh** against active user base; auto-freeze on hit; compliance review within 24h.
8. **Jurisdiction gating** = geo-IP + declared residence; block-list shown before KYC submission, not after.

---

## Summary table

| # | Question | Suggested pick | One-line reason |
|---|---|---|---|
| Q1 | Order book | Native XRPL DEX | Compliance via MPT RequireAuth; 3–4s finality matches mocks; skips ATS license; ~$0 infra. |
| Q2 | Wallet | Embedded non-custodial (Privy / Web3Auth) | Custodial UX, non-custodial classification; saves $2–5M licensing; Figma fits unchanged. |
| Q3 | Yield | Auto-drip + Auto-Reinvest toggle | No new screen needed; XRPL fees are nothing; clean 1099-DIV per period. |
| Q4 | Auth | 6-digit email OTP (Stytch) | Magic link silently fails in mobile in-app browsers; OTP is cross-device by default. |
| Q5 | KYC | Gate at first transaction | Open browse + sanctions screen at signup; full KYC on first Buy/Sell/Withdraw. |

## Notable side-effects to flag

- **Q3 treasury float** — choosing auto-drip surrenders ~$200k/yr T-bill yield at $50M AUM. If Surge wants that revenue stream, revisit toward claimable.
- **Q2 fallback** — if legal classifies embedded wallets as custody in our target jurisdictions, escalate to Fireblocks MPC custodial. Same Figma UX, much higher compliance cost.
- **Q1 MPT readiness** — if XLS-33 isn't on mainnet by build start, fall back to issued-currency tokens + RequireAuth trustlines. Same model, slightly worse ergonomics.
- **Q5 jurisdiction gating** must run early in onboarding, not late at KYC submission — otherwise users complete account creation only to be blocked.
- **Q4 high-value step-up** — passkey/biometric required before purchases >$10k and any withdrawal. Not in current mocks; add to design.
