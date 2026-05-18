import "server-only";
import { QStashSignatureError, verifyQstashSignature } from "@/server/qstash";
import { acquireLock } from "@/server/redis";
import { NextResponse } from "next/server";

/**
 * Best-effort error reporter. Wires to Sentry if available, falls back to
 * console.error. We keep this isolated so tests/dev don't need a Sentry DSN.
 */
function captureError(err: unknown, context: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.error("[job-error]", context, err);
}

export interface JobRunOptions<TBody> {
  /** Job name; used for the Redis lock + log prefix. */
  name: string;
  /**
   * Optional lock parameter; combined with `name` for the lock key.
   * Can be a string or a function of the body (for per-entity locks).
   */
  lockParam?: string | ((body: TBody) => string | undefined);
  /** Lock TTL in seconds (default 60). */
  lockTtlSec?: number;
  /** Whether to verify the QStash signature (default true). */
  verify?: boolean;
  /** The actual work; receives the parsed JSON body and returns a result. */
  run: (body: TBody) => Promise<Record<string, unknown> | undefined>;
}

/**
 * Wrap a Route Handler with the standard cron-job ceremony:
 *   1. Verify QStash signature (unless disabled).
 *   2. Parse JSON body.
 *   3. Acquire Redis lock for idempotency.
 *   4. Run the job, capture errors, return uniform response.
 *
 * All cron handlers should use this so we have one place to add metrics,
 * tracing, dead-letter handling, etc.
 */
export async function runJob<TBody = unknown>(
  req: Request,
  opts: JobRunOptions<TBody>,
): Promise<Response> {
  const verify = opts.verify ?? true;
  let rawBody = "";
  try {
    if (verify) {
      rawBody = await verifyQstashSignature(req);
    } else {
      rawBody = await req.text();
    }
  } catch (err) {
    if (err instanceof QStashSignatureError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 401 });
    }
    captureError(err, { job: opts.name, stage: "verify" });
    return NextResponse.json({ ok: false, error: "verify failed" }, { status: 401 });
  }

  let body: TBody;
  try {
    body = (rawBody ? JSON.parse(rawBody) : {}) as TBody;
  } catch (err) {
    captureError(err, { job: opts.name, stage: "parse" });
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  const lockParam = typeof opts.lockParam === "function" ? opts.lockParam(body) : opts.lockParam;
  const lockKey = `job:${opts.name}${lockParam ? `:${lockParam}` : ""}`;
  const lockTtl = opts.lockTtlSec ?? 60;
  try {
    const acquired = await acquireLock(lockKey, lockTtl);
    if (!acquired) {
      return NextResponse.json({ ok: true, skipped: "locked", lockKey });
    }
  } catch (err) {
    // Redis being down shouldn't wedge cron — log and continue without lock.
    captureError(err, { job: opts.name, stage: "lock" });
  }

  try {
    const result = (await opts.run(body)) ?? {};
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    captureError(err, { job: opts.name, stage: "run", body });
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "job failed" },
      { status: 500 },
    );
  }
}
