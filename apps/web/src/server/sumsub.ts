import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { http } from "@surgexrp/shared/http";

/**
 * Server-side Sumsub WebSDK + REST helper.
 *
 * - Signs every outbound request with HMAC-SHA256 per Sumsub's spec:
 *     X-App-Token        = SUMSUB_APP_TOKEN
 *     X-App-Access-Ts    = unix-seconds timestamp
 *     X-App-Access-Sig   = HMAC_SHA256(SUMSUB_SECRET_KEY, ts + method + path[+body])
 *
 * - When `SUMSUB_APP_TOKEN` / `SUMSUB_SECRET_KEY` are missing every public
 *   helper resolves to `null` so the calling action can surface a friendly
 *   "Sumsub not configured" error instead of crashing in local dev.
 *
 * Docs: https://docs.sumsub.com/reference/about-app-tokens
 */

const SUMSUB_BASE_URL = "https://api.sumsub.com";

interface SumsubConfig {
  appToken: string;
  secretKey: string;
}

function getConfig(): SumsubConfig | null {
  const appToken = process.env.SUMSUB_APP_TOKEN;
  const secretKey = process.env.SUMSUB_SECRET_KEY;
  if (!appToken || !secretKey) return null;
  return { appToken, secretKey };
}

/**
 * Compute `X-App-Access-Sig` per Sumsub docs.
 *
 * Signature payload is `ts + httpMethod + path + body` where:
 *  - `ts`        is the request-time unix-seconds timestamp (also sent as header)
 *  - `path`      includes the query string (e.g. `/resources/applicants?levelName=basic`)
 *  - `body`      is the exact request body string for write methods, "" for GET
 */
function signRequest(
  secretKey: string,
  ts: number,
  method: string,
  path: string,
  body: string,
): string {
  const payload = `${ts}${method.toUpperCase()}${path}${body}`;
  return createHmac("sha256", secretKey).update(payload).digest("hex");
}

interface SumsubRequest {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
}

async function sumsubFetch<T>(
  cfg: SumsubConfig,
  { method, path, body }: SumsubRequest,
): Promise<T> {
  const ts = Math.floor(Date.now() / 1000);
  const bodyString = body === undefined ? "" : JSON.stringify(body);
  const signature = signRequest(cfg.secretKey, ts, method, path, bodyString);

  const res = await http.request<T>({
    method,
    url: `${SUMSUB_BASE_URL}${path}`,
    data: body,
    headers: {
      "X-App-Token": cfg.appToken,
      "X-App-Access-Ts": String(ts),
      "X-App-Access-Sig": signature,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return res.data;
}

export interface SumsubApplicant {
  id: string;
  createdAt?: string;
  externalUserId?: string;
}

export interface SumsubAccessToken {
  token: string;
  userId: string;
}

export interface SumsubApplicantStatus {
  reviewStatus?: string;
  reviewResult?: { reviewAnswer?: "GREEN" | "RED"; reviewRejectType?: string };
}

/**
 * Create a Sumsub applicant for the given external (= our app) user id.
 *
 * Returns `null` when Sumsub isn't configured.
 */
export async function createApplicant(
  externalUserId: string,
  levelName = "basic-kyc-level",
): Promise<{ id: string } | null> {
  const cfg = getConfig();
  if (!cfg) return null;

  const path = `/resources/applicants?levelName=${encodeURIComponent(levelName)}`;
  const data = await sumsubFetch<SumsubApplicant>(cfg, {
    method: "POST",
    path,
    body: { externalUserId },
  });
  return { id: data.id };
}

export async function getApplicantStatus(
  applicantId: string,
): Promise<SumsubApplicantStatus | null> {
  const cfg = getConfig();
  if (!cfg) return null;
  const path = `/resources/applicants/${encodeURIComponent(applicantId)}/status`;
  return sumsubFetch<SumsubApplicantStatus>(cfg, { method: "GET", path });
}

/**
 * Mint a short-lived WebSDK access token. The client passes this to
 * `snsWebSdk.init(token, …)` to open the verification flow.
 */
export async function generateAccessToken(
  externalUserId: string,
  levelName = "basic-kyc-level",
  ttlInSecs = 600,
): Promise<SumsubAccessToken | null> {
  const cfg = getConfig();
  if (!cfg) return null;

  const qs = new URLSearchParams({
    userId: externalUserId,
    levelName,
    ttlInSecs: String(ttlInSecs),
  }).toString();
  const path = `/resources/accessTokens?${qs}`;
  return sumsubFetch<SumsubAccessToken>(cfg, { method: "POST", path });
}

/**
 * Constant-time HMAC verification for inbound webhooks. Uses
 * `SUMSUB_WEBHOOK_SECRET` rather than the API secret per Sumsub's docs.
 *
 * Sumsub sends `X-Payload-Digest` as a hex-encoded HMAC-SHA256 of the raw body.
 * Returns false if the secret isn't set or the digests don't match.
 */
export function verifyWebhookSignature(rawBody: string, headerSig: string | null): boolean {
  const secret = process.env.SUMSUB_WEBHOOK_SECRET;
  if (!secret || !headerSig) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(headerSig.trim(), "hex");
  if (a.length === 0 || a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isSumsubConfigured(): boolean {
  return getConfig() !== null;
}
