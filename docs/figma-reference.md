# Figma Node Reference

File: `Nx6wVQyPhX3GPDMqKPK6tB` · Root canvas: `1:7` · Project: **SurgeXRP**

URL: https://www.figma.com/design/Nx6wVQyPhX3GPDMqKPK6tB/SurgeXRP?node-id=1-7

## Distinct screens → variant node IDs

### Explore
| Variant | Node ID |
|---|---|
| Unauth (canonical) | `319:1980` |
| Unauth alt | `334:3168`, `374:18982`, `407:22343`, `407:19565` |
| Authenticated | `334:3431` |

### Asset Detail
| Variant | Node ID |
|---|---|
| Unauth | `329:2064` |
| Unauth + Auth modal | `338:6462` |
| Authenticated | `338:6579` |
| Auth + Purchase modal | `441:11859` |

### Marketplace (list)
| Variant | Node ID |
|---|---|
| Default | `340:7243` |
| Alts | `343:7569`, `433:7414`, `429:1080`, `350:14266` |
| Wallet dropdown open | `365:14648` |

### Trading
| Variant | Node ID |
|---|---|
| Market Order (8 frames) | `343:7814`, `425:8964`, `425:9271`, `425:9596`, `421:5125`, `421:5493`, `350:12549`, `350:11085` |
| Limit Order (3 frames) | `350:10351`, `350:13320`, `350:11812` |
| Confirm Order | `433:7762` |

### Portfolio
| Variant | Node ID |
|---|---|
| Overview populated | `365:14933`, `425:8758` |
| Overview empty | `366:15918` |
| Overview unauth | `432:2688` |
| All Assets (View All) | `366:15583`, `441:12029` |

### Withdraw Earnings
| Variant | Node ID |
|---|---|
| Empty form | `438:8146` |
| XRP valid | `441:9941` |
| RLUSD valid | `441:10760`, `441:11028` |
| XRP at max | `441:10489` |
| XRP over-balance | `441:10209` |
| RLUSD over-balance | `441:11606` |

### Profile
| Variant | Node ID |
|---|---|
| Not Verified | `366:16135` |
| Verified | `369:16621` |

### Purchase Asset Units
| Variant | Node ID |
|---|---|
| XRP valid | `339:6699` |
| RLUSD valid | `339:7060` |
| Insufficient funds | `339:6883` |

## Component IDs

| Name | ID |
|---|---|
| `_Pagination number base` (set) | `331:2463` |
| `Pagination Default` | `331:2464` |
| `Pagination Hover/active` | `331:2470` |
| `Icons` (set) | `336:3970` |
| `Icon name=plus` | `336:4249` |
| `Icon name=minus` | `336:4231` |
| `stock item` (set) | `346:10055` |
| `stock item=yes` | `346:10056` |
| `stock item=no` | `346:10062` |
| `buy and sell cell` | `346:10068` |
| `Logos / telegram-fill` | `407:22225` |

## Working with the file

- Pull a single frame via the Figma MCP: `get_figma_data(fileKey, nodeId)`.
- Download icons/images: `download_figma_images(fileKey, nodes, localPath)`.
- Raw full dump saved to: `.context/text/*.txt` (per-screen verbatim text) and `.context/design-system-raw.md` (tokens).
