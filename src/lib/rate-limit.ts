/**
 * Minimal in-memory, fixed-window rate limiter for Server Actions.
 *
 * apphosting.yaml pins maxInstances to 1, so a single in-memory map is
 * actually effective here (no need for a shared store across instances).
 */

const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

// Opportunistic cleanup so `buckets` doesn't grow unbounded under
// sustained traffic from many distinct IPs.
const MAX_TRACKED_KEYS = 5000;
function sweepExpired(now: number) {
  if (buckets.size < MAX_TRACKED_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

/**
 * Returns true if the call for `key` is allowed under `limit` requests
 * per rolling 60s window, false if the caller should be rejected.
 */
export function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count++;
  return true;
}

/** Best-effort caller IP from Server Action request headers. */
export function getClientIp(headerList: Headers): string {
  const forwardedFor = headerList.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return headerList.get('x-real-ip') || 'unknown';
}
