import Redis from "ioredis";

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return "redis://localhost:6379";
};

// Lazy singleton — the connection is only created on first use, not at import
// time. This prevents build-time crashes when Redis isn't reachable (e.g.
// Next.js page data collection on Railway).
let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(getRedisUrl(), {
      tls: process.env.REDIS_URL?.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
      maxRetriesPerRequest: 3,
      showFriendlyErrorStack: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    _redis.on("error", (error) => {
      const isConnectionError =
        error.name === "AggregateError" ||
        error.message?.includes("ECONNREFUSED") ||
        (error as any).code === "ECONNREFUSED" ||
        ((error as any).errors && (error as any).errors.some((e: any) =>
          e.code === "ECONNREFUSED" || e.message?.includes("ECONNREFUSED")
        ));

      if (isConnectionError) {
        if (!(_redis as any)?._logged_error) {
          console.warn("[Redis] Connection refused. Falling back to database.");
          if (_redis) (_redis as any)._logged_error = true;
        }
      } else {
        console.error("[Redis] Unexpected error:", error);
      }
    });
  }
  return _redis;
}

// Export a proxy that lazily initialises the real Redis client on first method
// call. Code that does `import redis from "./redis"; redis.get(...)` works
// unchanged — the connection just isn't opened until runtime.
const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const instance = getRedis();
    const value = (instance as any)[prop];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

export default redis;
