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

- Single email field — no password visible. Suggests **passwordless** (magic link or OTP). Spec the next step in technical doc.
- "Continue" submits; next screen not in current Figma export.
- Email validation: standard (regex client-side, server confirms).

### Out of scope in designs

- OTP / magic link verification screen.
- Wallet connection / generation flow on first sign-up.
- Forgot password / recovery (likely N/A for passwordless).
