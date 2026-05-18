import "server-only";
import { Receiver } from "@upstash/qstash";

/**
 * QStash signature verification for incoming job webhooks.
 *
 * Every job Route Handler MUST call this before doing anything.
 * Uses both current + next signing keys so we can rotate without downtime.
 */
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY ?? "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? "",
});

export class QStashSignatureError extends Error {
  readonly status = 401;
  constructor(message = "Invalid QStash signature") {
    super(message);
    this.name = "QStashSignatureError";
  }
}

/**
 * Verify the `Upstash-Signature` header on the incoming request.
 *
 * IMPORTANT: this consumes the request body via `req.clone().text()`, so the
 * caller should still be able to `await req.json()` afterward — Fetch `Request`
 * streams aren't replayable, so callers should pass `await req.text()` if they
 * need the raw body. We use clone() to keep things simple for handlers.
 *
 * Returns the raw body string for handlers to JSON.parse if they want.
 *
 * @throws QStashSignatureError on missing/invalid signature
 */
export async function verifyQstashSignature(req: Request): Promise<string> {
  const signature = req.headers.get("upstash-signature");
  if (!signature) throw new QStashSignatureError("Missing upstash-signature header");

  const body = await req.clone().text();

  let valid = false;
  try {
    valid = await receiver.verify({
      signature,
      body,
      url: req.url,
    });
  } catch (err) {
    throw new QStashSignatureError(`Signature verification failed: ${(err as Error).message}`);
  }

  if (!valid) throw new QStashSignatureError();
  return body;
}
