/**
 * In-memory sliding-window rate limiter.
 *
 * This is a first line of defence against bursts (e.g. a script hammering the
 * endpoint), scoped per warm server instance. It resets on cold start and is
 * NOT shared across instances — that's fine for burst protection, but it must
 * NOT be relied on as the only control. Pair it with a persistent, per-user
 * quota (see api-usage.ts) for the real cost/abuse limit.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bound memory growth: opportunistically sweep expired buckets.
let opsSinceSweep = 0;
function maybeSweep(now: number) {
  opsSinceSweep += 1;
  if (opsSinceSweep < 200) return;
  opsSinceSweep = 0;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  maybeSweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
