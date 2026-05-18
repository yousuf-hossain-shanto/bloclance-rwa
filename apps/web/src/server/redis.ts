import "server-only";
import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client (REST API).
 *
 * Used by QStash job handlers for:
 *   - order-book snapshot caching (xrpl-poll-book)
 *   - idempotency locks (acquireLock)
 *
 * We use the node entry — these handlers run on the Node runtime (Prisma + crypto).
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

export async function cacheGet<T>(key: string): Promise<T | null> {
  const value = await redis.get<T>(key);
  return value ?? null;
}

export async function cacheSet(key: string, val: unknown, ttlSec: number): Promise<void> {
  await redis.set(key, val, { ex: ttlSec });
}

/**
 * Best-effort idempotency lock via Redis SET NX.
 * Returns `true` if the caller acquired the lock, `false` if another worker holds it.
 *
 * TTL doubles as auto-release in case the holder crashes mid-job.
 */
export async function acquireLock(key: string, ttlSec: number): Promise<boolean> {
  const result = await redis.set(key, "1", { nx: true, ex: ttlSec });
  return result === "OK";
}
