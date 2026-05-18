# User Flows

## 1. First-time visitor → first investment

```
Landing (Explore unauth)
  → click property card
  → Asset Detail (unauth) — sees specs, "Invest now" CTA
  → click Invest now / Sign Up
  → Auth modal ("Log in or Sign up" by email)
  → Continue → email/OTP (out of scope of designs)
  → returns to Asset Detail (auth) with same property
  → "Invest now" → Purchase modal
  → set Units to buy, pick asset (XRP / RLUSD)
  → Purchase Now → confirmation
  → Overview shows new holding
```

## 2. Returning user → secondary trade

```
Login
  → Marketplace (35 properties listed by ROI, volume, price)
  → click property → Market Order screen (Buy default)
  → Toggle Buy/Sell, pick Market or Limit Order
  → enter units (+ price if Limit), pick settlement asset
  → Buy/Sell button → Confirm Order modal
  → "Confirm Buy" → order submitted ("asset right will be transferred once trade is matched")
```

## 3. Withdraw earnings

```
Overview → "Withdraw Earnings" button
  → Withdraw Earnings modal opens
  → Select Asset (XRP or RLUSD)
  → enter Wallet Address (destination)
  → Enter Amount (with Max. shortcut + USD equivalent for XRP)
  → validation: "Amount is insufficient. Enter amount in your wallet" if > balance
  → Total withdrawal preview
  → "Withdraw Earning" button submits
```

## 4. KYC

```
Profile → Human Verification "Not Verified" → Verify button
  → identity verification (out of scope of designs)
  → returns Verified state, unlocks gated features
```

## 5. Auth states across app

- **Unauthenticated**: top-right shows `Log in` + `Sign Up` buttons. Can browse Explore + Asset Detail. Marketplace/Overview/Profile likely gated (CTAs prompt sign-in).
- **Authenticated**: top-right shows truncated wallet address (e.g. `r62UiV...HfFA`) + caret. Click reveals dropdown: **XRP Wallet**, **RLUSD Wallet**, **My Profile**, **Sign Out**, plus KYC pill (*Not Verified* / *Verified*).

## Navigation

Primary nav (3 tabs, persistent top bar): **Overview** · **Explore** · **Marketplace**. Active tab is gold-accented.
