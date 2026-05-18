import "server-only";
import { Client } from "@upstash/qstash";

/**
 * QStash publish client — used to enqueue follow-up jobs from server code.
 *
 * Cron schedules themselves are configured externally (Upstash console / IaC),
 * not from this file. We only publish ad-hoc messages here, e.g.:
 *   - submitWithdrawal action → enqueue `tx-confirm` retry chain
 *   - yield-drip orchestrator → fan out per-chunk payouts
 */
const qstash = new Client({
  token: process.env.QSTASH_TOKEN ?? "",
});

function baseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL;
  if (!url) throw new Error("NEXT_PUBLIC_APP_URL / VERCEL_URL not configured");
  return url.startsWith("http") ? url : `https://${url}`;
}

export interface PublishJobOptions {
  /** Delay in seconds before QStash invokes the target. */
  delaySec?: number;
  /** Retry count override (QStash default is 3). */
  retries?: number;
}

/**
 * Publish a JSON message to one of our `/api/jobs/<name>` Route Handlers.
 *
 * @param target  Path on our own app, e.g. `"tx-confirm"` or `"yield-drip-chunk"`.
 * @param body    JSON-serialisable payload, forwarded as the request body.
 * @param options Optional delay + retry overrides.
 */
export async function publishJob(
  target: string,
  body: unknown,
  options: PublishJobOptions = {},
): Promise<{ messageId: string }> {
  const path = target.startsWith("/") ? target : `/api/jobs/${target}`;
  const url = `${baseUrl()}${path}`;

  const res = await qstash.publishJSON({
    url,
    body,
    ...(options.delaySec !== undefined ? { delay: options.delaySec } : {}),
    ...(options.retries !== undefined ? { retries: options.retries } : {}),
  });

  return { messageId: res.messageId };
}
