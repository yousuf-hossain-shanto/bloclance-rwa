# SurgeXRP — Project Spec

Tokenized real-world asset (RWA) platform on XRPL. Users buy fractional units of curated real estate properties, earn rental yield, trade units peer-to-peer in a marketplace.

Source of truth: [Figma file](https://www.figma.com/design/Nx6wVQyPhX3GPDMqKPK6tB/SurgeXRP) (file key `Nx6wVQyPhX3GPDMqKPK6tB`, root canvas node `1:7`).

## Index

### Product (non-technical)
- [Overview](01-overview.md) — what SurgeXRP is, value prop, scope
- [Glossary](02-glossary.md) — domain terms
- [User flows](03-user-flows.md) — end-to-end journeys
- [Features](04-features.md) — feature inventory by area

### Screens
- [Shell](screens/shell.md) — nav, footer, common elements
- [Auth](screens/auth.md) — login/signup modal
- [Explore](screens/explore.md) — public browse + asset detail
- [Marketplace](screens/marketplace.md) — trade listing
- [Trading](screens/trading.md) — market / limit / confirm order
- [Portfolio](screens/portfolio.md) — overview + holdings
- [Withdraw](screens/withdraw.md) — earnings withdrawal flow
- [Purchase](screens/purchase.md) — primary-issuance buy flow
- [Profile](screens/profile.md) — account, wallets, KYC

### Design system
- [Tokens](design/tokens.md) — colors, type, spacing, effects
- [Components](design/components.md) — reusable patterns

### Technical
- [Architecture](technical/architecture.md) — system overview, XRPL role
- [Data model](technical/data-model.md) — entities + fields
- [API surface](technical/api-surface.md) — implied endpoints + payloads

### Reference
- [Figma node map](figma-reference.md) — node IDs per screen/variant
- [Open questions](open-questions.md) — unresolved architectural choices with options + suggested picks + reasoning
