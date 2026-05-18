import "server-only";
import { type TxStatus, getTxStatus as xrplGetTxStatus } from "@surgexrp/xrpl";

/**
 * Thin wrapper around `@surgexrp/xrpl`'s `getTxStatus`.
 *
 * Adds a dev-time shortcut: any hash with the `MOCK_` prefix (seeded data,
 * local dev rows) is treated as validated so the reconciliation + tx-confirm
 * jobs can be exercised without a live XRPL connection.
 */
export type { TxStatus };

export async function getTxStatus(hash: string): Promise<TxStatus> {
  if (hash.startsWith("MOCK_")) {
    return { hash, validated: true, ledgerIndex: null, result: null };
  }
  return xrplGetTxStatus(hash);
}
