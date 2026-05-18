# Design Tokens

Source: Figma styles in file `Nx6wVQyPhX3GPDMqKPK6tB`. Full extract in `.context/design-system-raw.md`.

## Colors

### Brand
| Token | Hex | Use |
|---|---|---|
| `--color-brand-gold` | `#C8A749` | Primary action, ROI badge, highlights |
| `--color-brand-gold-light` | `#E7D8AF` | Subtle gold accents |
| `--color-brand-gold-subtle` | `#DBC587` | Hover/disabled variants |

### Surface (dark theme)
| Token | Hex / rgba | Use |
|---|---|---|
| `--color-bg-primary` | `#050C16` | Page background |
| `--color-bg-secondary` | `#091424` | Sections / nav |
| `--color-bg-tertiary` | `#0B1A2E` | Cards |
| `--color-surface-glass` | `rgba(255,255,255,0.05)` | Frosted panels |
| `--color-overlay-dark` | `rgba(11,26,46,0.6)` | Modal backdrop |

### Text
| Token | Hex / rgba | Use |
|---|---|---|
| `--color-text-primary` | `#FFFFFF` | Headings, body on dark |
| `--color-text-muted` | `rgba(255,255,255,0.6)` | Secondary text |
| `--color-text-subtle` | `rgba(255,255,255,0.4)` | Captions / labels |
| `--color-text-on-light` | `#222222` | Text on white cards |
| `--color-text-gray` | `#5E6875`, `#868686`, `#717680` | Mid-gray variants |

### Semantic
| Token | Hex | Use |
|---|---|---|
| `--color-success` | `#47CD89` (alt: `#17B26A`, `#05B40B`) | Positive deltas, verified pill, increased-value chart |
| `--color-success-bg` | `rgba(23,178,106,0.2)` | Success pills bg |
| `--color-error` | `#FF4A4D` | Validation errors, decreased-value chart |
| `--color-error-bg` | `rgba(240,68,56,0.2)` | Error pills bg |

### Gradients
- **Gold (button)**: `linear-gradient(48deg, #AA8B3D 0%, #C8A749 100%)`
- **Gold stroke**: `linear-gradient(180deg, #806B2F 0%, #B19441 100%)`
- **Gold overlay**: `linear-gradient(180deg, rgba(200,167,73,1) 6%, rgba(200,167,73,0) 100%)`
- **Dark fade (hero overlay)**: `linear-gradient(180deg, rgba(9,20,36,0) 72%, rgba(9,20,36,1) 100%)`
- **Green overlay (success accents)**: `linear-gradient(180deg, #17B26A 0%, #050C16 81%)`

## Typography

Family: **Figtree** (primary). **Eina03-SemiBold** used sparingly.

### Display scale (headings)
| Style | Size | LH | Weight | Letter-spacing |
|---|---|---|---|---|
| Display LG | 48 | 60 | 600 / 700 | -2% |
| Display MD | 36 | 44 | 600 | -2% |
| Display SM | 28 | — | 700 | — |
| Display XS | 24 | 32 | 600 / 700 | — |

### Text scale (body)
| Style | Size | LH | Weights |
|---|---|---|---|
| Text XL | 20 | 30 | 600, 700 |
| Text LG | 18 | 28 | 400, 600, 700 |
| Text MD | 16 | 24 | 400, 500, 600, 700 |
| Text SM | 14 | 20 | 400, 500, 600, 700 |
| Text XS | 12 | 18 | 400, 500, 600, 700 |

## Spacing & layout

### Radii
- `4`, `8`, `12`, `16` — standard component corners
- `50` — large containers (modals, hero panels)
- `999` — pills, badges, fully-rounded buttons

### Padding
Used: `4, 8, 10, 12, 14, 16, 19.5, 24, 35, 40, 48`.

Typical:
- Button (sm): `4 10`
- Button (md): `14 24`
- Button (lg): `14 35`
- Card inner: `16 24`, `24 40`

### Gaps (flex/grid)
- Micro: `2`, `4`
- Small: `8`, `10`
- Medium: `12`, `14`, `16`, `24`
- Large: `27`, `32`, `48`, `56`, `103+`

### Element sizing
- Icon: `16, 18, 24, 30, 32, 40`
- Button height: `40` (default), `48` (large)
- Canvas: 1440 wide (desktop-first)

## Effects

### Shadows
- `0 0 4 rgba(0,0,0,0.12)` — subtle elevation
- `0 4 13 rgba(0,0,0,0.35)` — card hover / modals
- `0 0 24 rgba(0,0,0,0.4)` — strong elevation

### Blurs
- `blur(24px)` — modal backdrop / glass panels
- `blur(54px)` — strong frosted overlays
- `blur(170px)` — ambient background light blooms (gold)

### Backdrop filters
- `backdrop-filter: blur(24px)` with `rgba(255,255,255,0.05–0.2)` for glass cards
- `backdrop-filter: blur(54px)` with `rgba(11,26,46,0.6)` for full modals
