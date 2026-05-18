// xrpl.js v4 adapter for SurgeXRP.
//
// Server-only helpers around `xrpl` that:
//   - keep a singleton WebSocket `Client` per endpoint (lazy connect)
//   - build unsigned tx JSON for OfferCreate / OfferCancel / Payment / TrustSet
//   - sign with the server-held issuer seed (primary issuance, withdrawals)
//   - submit signed blobs and surface validated ledger results
//   - read `book_offers` / `account_tx` / `account_info` / `account_lines`
//   - shape XRPL responses into the @surgexrp/shared types the UI already uses
//
// Lazy/dynamic import of `xrpl` is intentional: keeps build prerender happy
// and avoids dragging the WS client into the browser bundle.

import type {
  AccountTxResponse,
  AccountTxTransaction,
  SubmitResponse,
  SubmittableTransaction,
  TxResponse,
  BookOffer as XrplBookOffer,
  Client as XrplClient,
  OfferCancel as XrplOfferCancel,
  OfferCreate as XrplOfferCreate,
  Payment as XrplPayment,
  TrustSet as XrplTrustSet,
  Wallet as XrplWallet,
} from "xrpl";

// Re-exported domain types (kept stable so callers don't import `xrpl` directly).
export type Asset = "XRP" | "RLUSD";

/** XRPL OfferCreate flag — fill what can, kill the rest. */
export const TF_IMMEDIATE_OR_CANCEL = 0x0004_0000;
/** OfferCreate flag — sell exactly TakerGets, no partial fills. */
export const TF_FILL_OR_KILL = 0x0008_0000;
/** OfferCreate flag — Sell side hint (TakerGets is fully spent). */
export const TF_SELL = 0x0008_0000;

export interface IssuedAmount {
  currency: string;
  issuer: string;
  value: string;
}
export type Amount = string | IssuedAmount;

export interface OfferCreateParams {
  account: string;
  takerGets: Amount;
  takerPays: Amount;
  flags?: number;
  /** Ripple-time seconds since 2000-01-01 UTC. */
  expiration?: number;
  memos?: Array<{ memoType?: string; memoData?: string }>;
}

export interface OfferCancelParams {
  account: string;
  offerSequence: number;
}

export interface PaymentParams {
  account: string;
  destination: string;
  amount: Amount;
  destinationTag?: number;
  memos?: Array<{ memoType?: string; memoData?: string }>;
}

export interface TrustSetParams {
  account: string;
  currency: string;
  issuer: string;
  limit: string;
}

export interface OrderBookLevel {
  pricePerUnit: string;
  units: number;
}
export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdated: string;
}

export interface Trade {
  id: string;
  hash: string;
  ledgerIndex: number;
  occurredAtMs: number;
  side: "Buy" | "Sell";
  units: number;
  pricePerUnit: string;
}

export interface Candle {
  t: number;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
}

export interface SubmitResult {
  hash: string;
  validated: boolean;
  result: TxResponse["result"] | SubmitResponse["result"];
}

export interface TxStatus {
  hash: string;
  validated: boolean;
  ledgerIndex: number | null;
  result: TxResponse["result"] | null;
}

// ---------------------------------------------------------------------------
// Lazy import + client singleton
// ---------------------------------------------------------------------------

type XrplModule = typeof import("xrpl");
let _xrplModulePromise: Promise<XrplModule> | null = null;
async function loadXrpl(): Promise<XrplModule> {
  if (!_xrplModulePromise) {
    _xrplModulePromise = import("xrpl");
  }
  return _xrplModulePromise;
}

const _clients = new Map<string, XrplClient>();
let _shutdownRegistered = false;

function defaultEndpoint(): string {
  return process.env.XRPL_ENDPOINT ?? "wss://s.altnet.rippletest.net:51233";
}

function registerShutdown(): void {
  if (_shutdownRegistered) return;
  _shutdownRegistered = true;
  const close = async (): Promise<void> => {
    for (const c of _clients.values()) {
      try {
        if (c.isConnected()) await c.disconnect();
      } catch {
        /* ignore */
      }
    }
    _clients.clear();
  };
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on("beforeExit", close);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on("SIGTERM", close);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on("SIGINT", close);
}

/**
 * Returns a connected xrpl `Client` for the endpoint. Reuses one client per
 * endpoint so we don't churn WebSocket connections across requests.
 * NEVER call at module top-level — that breaks Next.js prerender.
 */
export async function getClient(endpoint: string = defaultEndpoint()): Promise<XrplClient> {
  const cached = _clients.get(endpoint);
  if (cached?.isConnected()) return cached;
  const { Client } = await loadXrpl();
  const client = cached ?? new Client(endpoint);
  _clients.set(endpoint, client);
  if (!client.isConnected()) await client.connect();
  registerShutdown();
  return client;
}

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

export async function xrpToDrops(xrp: string | number): Promise<string> {
  const { xrpToDrops: f } = await loadXrpl();
  return f(xrp);
}

export async function dropsToXrp(drops: string | number): Promise<string> {
  const { dropsToXrp: f } = await loadXrpl();
  return String(f(drops));
}

function encodeMemo(memo: { memoType?: string; memoData?: string }): {
  Memo: { MemoType?: string; MemoData?: string };
} {
  const toHex = (s: string): string => Buffer.from(s, "utf8").toString("hex").toUpperCase();
  return {
    Memo: {
      ...(memo.memoType ? { MemoType: toHex(memo.memoType) } : {}),
      ...(memo.memoData ? { MemoData: toHex(memo.memoData) } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Tx builders — return unsigned JSON. Caller must `autofill` + sign + submit.
// ---------------------------------------------------------------------------

export function buildOfferCreate(params: OfferCreateParams): XrplOfferCreate {
  const tx: XrplOfferCreate = {
    TransactionType: "OfferCreate",
    Account: params.account,
    TakerGets: params.takerGets,
    TakerPays: params.takerPays,
  };
  if (params.flags !== undefined) tx.Flags = params.flags;
  if (params.expiration !== undefined) tx.Expiration = params.expiration;
  if (params.memos?.length) tx.Memos = params.memos.map(encodeMemo);
  return tx;
}

export function buildOfferCancel(params: OfferCancelParams): XrplOfferCancel {
  return {
    TransactionType: "OfferCancel",
    Account: params.account,
    OfferSequence: params.offerSequence,
  };
}

export function buildPayment(params: PaymentParams): XrplPayment {
  const tx: XrplPayment = {
    TransactionType: "Payment",
    Account: params.account,
    Destination: params.destination,
    Amount: params.amount,
  };
  if (params.destinationTag !== undefined) tx.DestinationTag = params.destinationTag;
  if (params.memos?.length) tx.Memos = params.memos.map(encodeMemo);
  return tx;
}

export function buildTrustSet(params: TrustSetParams): XrplTrustSet {
  return {
    TransactionType: "TrustSet",
    Account: params.account,
    LimitAmount: {
      currency: params.currency,
      issuer: params.issuer,
      value: params.limit,
    },
  };
}

// ---------------------------------------------------------------------------
// Autofill + sign + submit
// ---------------------------------------------------------------------------

export async function autofill<T extends SubmittableTransaction>(
  tx: T,
  client?: XrplClient,
): Promise<T> {
  const c = client ?? (await getClient());
  return (await c.autofill(tx)) as T;
}

/**
 * Server-side seed signing. Only ever called with `XRPL_ISSUER_SEED` (or a
 * KMS-recovered seed). Never expose to the client bundle.
 */
export async function signWithSeed(
  tx: SubmittableTransaction,
  seed: string,
  client?: XrplClient,
): Promise<{ tx_blob: string; hash: string }> {
  const { Wallet } = await loadXrpl();
  const wallet: XrplWallet = Wallet.fromSeed(seed);
  const filled = await autofill(tx, client);
  return wallet.sign(filled);
}

const FATAL_ENGINE_RESULT_PREFIXES = ["tem", "tef"] as const;

/**
 * Submit a pre-signed tx blob and wait for ledger validation. Throws on a
 * fatal engine result (tem* / tef*) so callers can surface a clean error.
 */
export async function submitAndWait(
  signedTxBlob: string,
  client?: XrplClient,
): Promise<SubmitResult> {
  const c = client ?? (await getClient());
  const res = await c.submitAndWait(signedTxBlob);
  const meta = res.result?.meta;
  const engineResult =
    typeof meta === "object" && meta !== null && "TransactionResult" in meta
      ? (meta as { TransactionResult?: string }).TransactionResult
      : undefined;
  if (engineResult && FATAL_ENGINE_RESULT_PREFIXES.some((p) => engineResult.startsWith(p))) {
    throw new Error(`XRPL submit failed: ${engineResult}`);
  }
  return {
    hash: res.result.hash,
    validated: Boolean(res.result.validated),
    result: res.result,
  };
}

/** Stateless submit — does NOT wait for validation. Useful when the caller polls separately. */
export async function submitTx(
  signedTxBlob: string,
  client?: XrplClient,
): Promise<{ hash: string; engine_result: string }> {
  const c = client ?? (await getClient());
  const res = await c.submit(signedTxBlob);
  return {
    hash: res.result.tx_json?.hash ?? "",
    engine_result: res.result.engine_result,
  };
}

export async function getTxStatus(hash: string, client?: XrplClient): Promise<TxStatus> {
  const c = client ?? (await getClient());
  try {
    const res = (await c.request({ command: "tx", transaction: hash })) as TxResponse;
    return {
      hash,
      validated: Boolean(res.result.validated),
      ledgerIndex: res.result.ledger_index ?? null,
      result: res.result,
    };
  } catch (err) {
    // `txnNotFound` simply means it's not on the ledger yet.
    const msg = (err as Error)?.message ?? "";
    if (msg.includes("txnNotFound")) {
      return { hash, validated: false, ledgerIndex: null, result: null };
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Reads — order book, account_tx
// ---------------------------------------------------------------------------

export interface FetchBookOffersParams {
  takerPays: Amount;
  takerGets: Amount;
  limit?: number;
}

/**
 * `book_offers` — orders selling `takerGets` for `takerPays`.
 * We assume one offer = one price level (no aggregation). The pricePerUnit is
 * derived from the offered amounts; units come from TakerGets value.
 */
export async function fetchBookOffers(
  params: FetchBookOffersParams,
  client?: XrplClient,
): Promise<OrderBook> {
  const c = client ?? (await getClient());
  const takerPaysSpec = toCurrencySpec(params.takerPays);
  const takerGetsSpec = toCurrencySpec(params.takerGets);

  // Bids: people offering RLUSD/XRP for property units (we want to buy property).
  const bidsRes = await c.request({
    command: "book_offers",
    taker_pays: takerPaysSpec,
    taker_gets: takerGetsSpec,
    limit: params.limit ?? 50,
  });

  // Asks: flip the book.
  const asksRes = await c.request({
    command: "book_offers",
    taker_pays: takerGetsSpec,
    taker_gets: takerPaysSpec,
    limit: params.limit ?? 50,
  });

  const bids = mapBookOffers(bidsRes.result.offers as XrplBookOffer[], "bid");
  const asks = mapBookOffers(asksRes.result.offers as XrplBookOffer[], "ask");

  return {
    bids,
    asks,
    lastUpdated: new Date().toISOString(),
  };
}

function toCurrencySpec(a: Amount): { currency: string; issuer?: string } {
  if (typeof a === "string") return { currency: "XRP" };
  return { currency: a.currency, issuer: a.issuer };
}

function amountValue(a: Amount | unknown): string {
  if (typeof a === "string") return a;
  if (a && typeof a === "object" && "value" in (a as Record<string, unknown>)) {
    return String((a as { value: string }).value);
  }
  return "0";
}

function mapBookOffers(offers: XrplBookOffer[], _side: "bid" | "ask"): OrderBookLevel[] {
  if (!offers?.length) return [];
  return offers.map((o) => {
    const getsVal = amountValue(o.TakerGets);
    const paysVal = amountValue(o.TakerPays);
    const gets = Number(getsVal);
    const pays = Number(paysVal);
    const price = gets > 0 ? (pays / gets).toString() : "0";
    return {
      pricePerUnit: price,
      units: Math.floor(gets),
    };
  });
}

export interface FetchAccountTxParams {
  account: string;
  limit?: number;
  marker?: unknown;
  /** Inclusive lower bound (ledger_index_min). */
  ledgerIndexMin?: number;
  ledgerIndexMax?: number;
}

export async function fetchAccountTx(
  params: FetchAccountTxParams,
  client?: XrplClient,
): Promise<AccountTxResponse> {
  const c = client ?? (await getClient());
  return (await c.request({
    command: "account_tx",
    account: params.account,
    limit: params.limit ?? 200,
    ledger_index_min: params.ledgerIndexMin ?? -1,
    ledger_index_max: params.ledgerIndexMax ?? -1,
    ...(params.marker !== undefined ? { marker: params.marker } : {}),
  })) as AccountTxResponse;
}

/** Legacy parser kept for back-compat. Returns flat record list. */
export interface AccountTxRecord {
  hash: string;
  ledgerIndex: number;
  type: string;
  date: number;
}
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

const RIPPLE_EPOCH_OFFSET_MS = 946_684_800_000; // 2000-01-01T00:00:00Z

/**
 * Extract settled OfferCreate fills involving `propertyIssuer` from an
 * account_tx response. We approximate "side" from whether the issuer is the
 * one receiving the property token (issuance/buy) or sending it (sell).
 */
export function parseAccountTxToTrades(
  response: AccountTxResponse,
  propertyIssuer: string,
  propertyCurrency: string,
): Trade[] {
  const out: Trade[] = [];
  const txs: AccountTxTransaction[] = response.result?.transactions ?? [];
  for (const t of txs) {
    const tx = (t.tx_json ?? (t as unknown as { tx?: Record<string, unknown> }).tx) as
      | Record<string, unknown>
      | undefined;
    if (!tx) continue;
    const meta = t.meta as { TransactionResult?: string; AffectedNodes?: unknown[] } | undefined;
    if (!meta || meta.TransactionResult !== "tesSUCCESS") continue;
    if (tx.TransactionType !== "OfferCreate") continue;

    const hash = (tx.hash as string) ?? "";
    const ledgerIndex = (t.ledger_index ?? (tx.ledger_index as number) ?? 0) as number;
    const dateRipple = (tx.date as number) ?? 0;
    const occurredAtMs = dateRipple * 1000 + RIPPLE_EPOCH_OFFSET_MS;

    const gets = tx.TakerGets as Amount;
    const pays = tx.TakerPays as Amount;
    const propertySide = matchesAsset(gets, propertyCurrency, propertyIssuer)
      ? "sell"
      : matchesAsset(pays, propertyCurrency, propertyIssuer)
        ? "buy"
        : null;
    if (!propertySide) continue;

    const units = propertySide === "sell" ? Number(amountValue(gets)) : Number(amountValue(pays));
    const counter = propertySide === "sell" ? Number(amountValue(pays)) : Number(amountValue(gets));
    const pricePerUnit = units > 0 ? (counter / units).toString() : "0";

    out.push({
      id: hash,
      hash,
      ledgerIndex,
      occurredAtMs,
      side: propertySide === "buy" ? "Buy" : "Sell",
      units: Math.floor(units),
      pricePerUnit,
    });
  }
  return out;
}

function matchesAsset(a: Amount, currency: string, issuer: string): boolean {
  if (typeof a === "string") return false;
  return a.currency === currency && a.issuer === issuer;
}

// ---------------------------------------------------------------------------
// OHLCV aggregation
// ---------------------------------------------------------------------------

export type CandleInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

const INTERVAL_MS: Record<CandleInterval, number> = {
  "1m": 60_000,
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "1h": 60 * 60_000,
  "4h": 4 * 60 * 60_000,
  "1d": 24 * 60 * 60_000,
};

export function aggregateCandles(trades: Trade[], interval: CandleInterval = "1h"): Candle[] {
  const bucketMs = INTERVAL_MS[interval];
  const buckets = new Map<number, Candle>();
  // Sort ascending to make OHLC well-defined.
  const ordered = [...trades].sort((a, b) => a.occurredAtMs - b.occurredAtMs);
  for (const tr of ordered) {
    const bucketStart = Math.floor(tr.occurredAtMs / bucketMs) * bucketMs;
    const px = Number(tr.pricePerUnit);
    const vol = tr.units;
    const existing = buckets.get(bucketStart);
    if (!existing) {
      buckets.set(bucketStart, {
        t: bucketStart,
        o: tr.pricePerUnit,
        h: tr.pricePerUnit,
        l: tr.pricePerUnit,
        c: tr.pricePerUnit,
        v: String(vol),
      });
    } else {
      const h = Math.max(Number(existing.h), px);
      const l = Math.min(Number(existing.l), px);
      existing.h = h.toString();
      existing.l = l.toString();
      existing.c = tr.pricePerUnit;
      existing.v = String(Number(existing.v) + vol);
    }
  }
  return [...buckets.values()].sort((a, b) => a.t - b.t);
}

// ---------------------------------------------------------------------------
// Account info / lines (wallet balances)
// ---------------------------------------------------------------------------

export interface AccountInfo {
  xrpDrops: string;
  sequence: number;
  ownerCount: number;
}

export async function fetchAccountInfo(
  account: string,
  client?: XrplClient,
): Promise<AccountInfo | null> {
  const c = client ?? (await getClient());
  try {
    const res = await c.request({
      command: "account_info",
      account,
      ledger_index: "validated",
    });
    const data = res.result.account_data;
    return {
      xrpDrops: data.Balance,
      sequence: data.Sequence,
      ownerCount: data.OwnerCount ?? 0,
    };
  } catch (err) {
    if ((err as Error)?.message?.includes("actNotFound")) return null;
    throw err;
  }
}

export interface AccountLine {
  currency: string;
  issuer: string;
  balance: string;
  limit: string;
}

export async function fetchAccountLines(
  account: string,
  client?: XrplClient,
): Promise<AccountLine[]> {
  const c = client ?? (await getClient());
  try {
    const res = await c.request({ command: "account_lines", account });
    return (res.result.lines ?? []).map((l) => ({
      currency: l.currency,
      issuer: l.account,
      balance: l.balance,
      limit: l.limit,
    }));
  } catch (err) {
    if ((err as Error)?.message?.includes("actNotFound")) return [];
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Ripple time helpers (Expiration uses ripple-time, not unix seconds)
// ---------------------------------------------------------------------------

export async function rippleTimeFromUnixMs(unixMs: number): Promise<number> {
  const { unixTimeToRippleTime } = await loadXrpl();
  return unixTimeToRippleTime(unixMs);
}
