# Auth

## Login / Sign-up modal

Triggered by `Log in` or `Sign Up` button in shell, or by gated CTAs (e.g. "Invest now" on Asset Detail when unauth).

Source frame variant: `338:6462` (Explore // View Asset with auth modal open).

### Layout

Centered modal on dark backdrop with blur. Glassmorphic panel.

### Content (verbatim)

- Title: **Log in or Sign up**
- Subtitle: *Provide your details below to authenticate*
- Field: **Email Address** — placeholder *Enter your email address*
- Primary button: **Continue**
- Legal: *By clicking on continue, you agree to our **user terms** and **agreement***
- (Terms/agreement link inline, bold.)

### Behavior

- Single email field — passwordless. **6-digit email OTP** (decided — see [open-questions.md](../open-questions.md#q4)).
- "Continue" submits → server sends 6-digit code via Stytch → next screen is a code-input UI (to design — not in current Figma export).
- Email validation: standard (regex client-side, server confirms).

### Next screen to design (OTP input)

- 6 numeric digits, auto-advance per digit, paste-detection (whole code paste fills all 6).
- "Resend in 30s" button + "Use different email" link.
- Error states: "Code expired (10 min TTL)", "Too many attempts — try again in 30 min".
- On success: HTTP-only session cookie set → land in dashboard.

### Wallet provisioning

On first successful OTP verify, the backend triggers **Privy / Web3Auth** to create the user's embedded XRPL wallet (MPC keyshares; user/email-bound). The r-address is persisted to `users.xrp_address`. No additional screen needed — happens in background; first dashboard load shows the new Surge Wallet pill.

### Out of scope in designs (to add)

- OTP code-input screen.
- Step-up auth (passkey or device biometric) screen — required before purchases >$10k and any withdrawal.
- KYC modal launched at first Buy/Sell/Withdraw click — provider: Sumsub WebSDK.
- Forgot/recovery flow — passwordless, but cover the "lost device + lost mailbox" edge via wallet recovery (Privy social + passkey).
