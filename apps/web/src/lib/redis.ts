import "server-only";

/**
 * Lazy Upstash Redis singleton. Returns null if env vars aren't configured —
 * callers should fall back to recomputing the cached value in that case.
 *
 * Why lazy: keeps Next.js build / prerender from importing redis at module
 * top-level (would require live env vars at build time on Vercel).
 */
let _client: import("@upstash/redis").Redis | null = null;
let _disabled = false;

export async function getRedis(): Promise<import("@upstash/redis").Redis | null> {
  if (_client) return _client;
  if (_disabled) return null;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    _disabled = true;
    return null;
  }
  const { Redis } = await import("@upstash/redis");
  _client = new Redis({ url, token });
  return _client;
}

/**
 * `cached(key, ttl, factory)` — read-through cache with JSON (de)serialization.
 * Silently falls back to invoking `factory` if Redis is unconfigured or errors.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  factory: () => Promise<T>,
): Promise<T> {
  const redis = await getRedis();
  if (!redis) return factory();
  try {
    const hit = (await redis.get(key)) as T | null;
    if (hit !== null && hit !== undefined) return hit;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[redis] get failed:", (err as Error)?.message);
    }
  }
  const fresh = await factory();
  try {
    await redis.set(key, fresh, { ex: ttlSeconds });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[redis] set failed:", (err as Error)?.message);
    }
  }
  return fresh;
}
