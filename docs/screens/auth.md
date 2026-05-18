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

- Single email field — passwordless. **6-digit email OTP via Privy** (decided — see [open-questions.md](../open-questions.md#q4)).
- "Continue" hands the email to Privy's SDK → Privy sends OTP → user enters code in Privy's modal flow → Privy issues session JWT and provisions an XRPL embedded wallet in one step.
- The Figma "Continue" submit + the next code-input screen are both rendered by **Privy's hosted UI components** (themed to match SurgeXRP colors via Privy's appearance config).
- Email validation: handled by Privy.

### Wallet provisioning

Privy creates the user's XRPL embedded wallet on first successful OTP verify (MPC keyshares; user/email-bound). The r-address is returned to the app and persisted to `users.xrp_address` + `users.privy_user_id`. No additional screen — first dashboard load shows the new Surge Wallet pill.

### Out of scope in current Figma (handled by Privy / not needed)

- OTP code-input screen → Privy renders it.
- Forgot/recovery flow → Privy handles via social + passkey recovery.
- KYC modal → triggered at first Buy/Sell/Withdraw click (Sumsub WebSDK), not at auth.
