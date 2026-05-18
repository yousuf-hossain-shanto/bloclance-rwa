import { FormRow, KpiTile } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Total Wallet Value KPI tile. Renders a `<KpiTile>` with a `$158,368`
 * headline plus the XRP + RLUSD breakdown rows from
 * `docs/screens/portfolio.md`.
 *
 * The breakdown sits in a sibling block (not inside `KpiTile.secondary`)
 * because `secondary` is rendered inside a `<p>` element by the library —
 * stuffing `<FormRow>` (a `<div>`) in there would be invalid HTML. The
 * breakdown uses `FormRow` per the component catalog (`Used on: …
 * WalletBreakdownRow`).
 */
export function WalletValueTile(): ReactElement {
  return (
    <div className="space-y-3">
      <KpiTile label="Total Wallet Value" value="$158,368" size="lg" />
      <div className="space-y-2 rounded-2xl border border-white/5 bg-bg-tertiary/40 p-5 backdrop-blur-md">
        <FormRow label="XRP" value="38,202.40 XRP ($55,000)" />
        <FormRow label="RLUSD" value="$103,368" />
      </div>
    </div>
  );
}
