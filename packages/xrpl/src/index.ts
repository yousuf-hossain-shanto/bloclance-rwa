// xrpl.js helpers — see docs/technical/architecture.md "Settlement layer: XRPL"
// All functions are stubs that return shapes consistent with xrpl.js v4.
// Wire to real submit logic in M1.

export type Asset = "XRP" | "RLUSD";

export interface OfferCreateParams {
  account: string;
  takerGets: { currency: string; issuer?: string; value: string };
  takerPays: { currency: string; issuer?: string; value: string };
  /** ImmediateOrCancel for market orders. */
  immediateOrCancel?: boolean;
  /** Unix-seconds expiry for limit orders. */
  expirationSeconds?: number;
}

export interface PaymentParams {
  account: string;
  destination: string;
  amount: string | { currency: string; issuer: string; value: string };
  destinationTag?: number;
}

export interface UnsignedTx {
  TransactionType: string;
  [key: string]: unknown;
}

/** Build an unsigned OfferCreate tx for XRPL DEX. */
export function buildOfferCreate(params: OfferCreateParams): UnsignedTx {
  const tfImmediateOrCancel = 0x00040000;
  return {
    TransactionType: "OfferCreate",
    Account: params.account,
    TakerGets: params.takerGets,
    TakerPays: params.takerPays,
    ...(params.immediateOrCancel ? { Flags: tfImmediateOrCancel } : {}),
    ...(params.expirationSeconds ? { Expiration: params.expirationSeconds } : {}),
  };
}

/** Build an unsigned Payment tx (primary issuance, withdrawal, yield drip). */
export function buildPayment(params: PaymentParams): UnsignedTx {
  return {
    TransactionType: "Payment",
    Account: params.account,
    Destination: params.destination,
    Amount: params.amount,
    ...(params.destinationTag !== undefined ? { DestinationTag: params.destinationTag } : {}),
  };
}

export interface AccountTxRecord {
  hash: string;
  ledgerIndex: number;
  type: string;
  date: number;
}

/** Parse `account_tx` RPC response into a flat record list. */
export function parseAccountTx(raw: unknown): AccountTxRecord[] {
  if (!raw || typeof raw !== "object") return [];
  const root = raw as { result?: { transactions?: Array<Record<string, unknown>> } };
  const txs = root.result?.transactions ?? [];
  return txs.map((t) => {
    const tx = (t.tx ?? t) as Record<string, unknown>;
    return {
      hash: (tx.hash as string) ?? "",
      ledgerIndex: (tx.ledger_index as number) ?? 0,
      type: (tx.TransactionType as string) ?? "Unknown",
      date: (tx.date as number) ?? 0,
    };
  });
}

/** Submit a signed tx via xrplcluster. Currently returns a mock hash for scaffolding. */
export async function submitTx(
  _signedBlob: string,
): Promise<{ hash: string; engine_result: string }> {
  // TODO: wire to xrpl Client.submit() or xior POST to xrplcluster.com with `submit` method
  return {
    hash: `MOCK_${Date.now().toString(16).toUpperCase()}`,
    engine_result: "tesSUCCESS",
  };
}

export interface BookOffer {
  account: string;
  pricePerUnit: string;
  units: string;
  side: "bid" | "ask";
}

/** Stub: query order book offers for a property. */
export async function fetchBookOffers(_propertyId: string): Promise<BookOffer[]> {
  return [];
}
