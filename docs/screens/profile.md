# Profile

Account management page. Auth required.

Variants: `366:16135` (Not Verified), `369:16621` (Verified).

## Layout

```
[Top nav with wallet pill]
[Header: title + subtitle]
[Avatar + Change Profile Picture]
[Your Surge Wallets section]
[Human Verification section]
[Your Details section]
[Footer]
```

## Header

- Title: **Profile**
- Subtitle: *Manage your profile and view your portfolio*

## Avatar

- Profile picture display
- Action: **Change Profile Picture** (link/button — opens upload picker)

## Your Surge Wallets

- Section heading: **Your Surge Wallets**
- Helper: *To fund wallet, copy the correct address and send token*
- Wallet rows:
  - **XRP Wallet** — `r62UiV...HfFA` — **Copy** button
  - **RLUSD Wallet** — `r62UiV...HfFA` — **Copy** button
- Notice banner: *Fund wallet with local currency is coming soon*

## Human Verification (KYC)

- Section heading: **Human Verification**
- Subtitle: *Verify your identity to unlock all features*
- **Not Verified** state: red/orange status pill + **Verify** CTA button.
- **Verified** state: green status pill, CTA hidden.

## Your Details

- Section heading: **Your Details**
- Fields:
  - **Display Name** — input, placeholder *Enter a display name*
  - **Email Address** — populated, e.g. `jonathan.segwell@email` (read-only from auth)

## Behavior

- Copy buttons → copy to clipboard + flash confirmation (spec it).
- Verify CTA → Sumsub WebSDK modal (ID + selfie + address). Returns to Profile with `Verified` state.
- Display Name edit → debounced save, success toast.
- Email is auth-bound, not editable here. Email change flow out of scope.
