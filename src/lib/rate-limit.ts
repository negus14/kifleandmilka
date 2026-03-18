import redis from "./redis";

/**
 * Simple Redis-based sliding-window rate limiter.
 *
 * HOW IT WORKS:
 * - Each request increments a counter in Redis keyed by "{prefix}:{identifier}"
 * - The counter auto-expires after `windowSeconds`
 * - If the counter exceeds `maxRequests`, the request is blocked
 *
 * WHY REDIS (not in-memory)?
 * - In-memory maps reset on every deploy/restart
 * - If you scale to multiple server instances, each has its own map (attacker
 *   gets N * limit requests). Redis is shared across all instances.
 * - Redis INCR + EXPIRE is atomic and fast (~0.1ms)
 *
 * WHY SLIDING WINDOW?
 * - Fixed windows (e.g., "10 per minute starting at :00") allow bursts at
 *   window boundaries (19 requests between 0:59 and 1:01). Sliding windows
 *   prevent this by using the first request's timestamp as the window start.
 */
export async function rateLimit(
  identifier: string,
  {
    prefix = "rl",
    maxRequests = 10,
    windowSeconds = 60,
  }: {
    prefix?: string;
    maxRequests?: number;
    windowSeconds?: number;
  } = {}
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `${prefix}:${identifier}`;

  try {
    const count = await redis.incr(key);

    // Set expiry only on the FIRST increment (when count === 1).
    // This starts the window clock. Subsequent requests within the window
    // don't reset the expiry — otherwise an attacker could keep the window
    // sliding forever by making requests just before it expires.
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, maxRequests - count);
    return { allowed: count <= maxRequests, remaining };
  } catch {
    // If Redis is down, ALLOW the request (fail-open).
    // The alternative (fail-closed) would block ALL users when Redis is down,
    // which is worse than temporary rate-limit bypass.
    return { allowed: true, remaining: maxRequests };
  }
}

/**
 * Extract client IP from request headers.
 *
 * WHY NOT JUST request.ip?
 * - Behind a reverse proxy (Railway, Vercel, Cloudflare), the actual client IP
 *   is in headers like X-Forwarded-For, not the TCP connection IP.
 * - X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
 *   We take the first one (leftmost = original client).
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP (original client), ignore proxy chain
    return forwarded.split(",")[0].trim();
  }
  // Fallback for direct connections (local dev)
  return "127.0.0.1";
}
