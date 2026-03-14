import Redis from "ioredis";

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return "redis://localhost:6379";
};

const redis = new Redis(getRedisUrl(), {
  // Railway provides an internal URL that usually doesn't need SSL, 
  // but for external access it might.
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
  maxRetriesPerRequest: 3, // Reduce retries to fail faster when Redis is down
  showFriendlyErrorStack: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("error", (error) => {
  // Check for connection refusal in both standard and AggregateErrors
  const isConnectionError = 
    error.name === "AggregateError" ||
    error.message?.includes("ECONNREFUSED") || 
    (error as any).code === "ECONNREFUSED" ||
    ((error as any).errors && (error as any).errors.some((e: any) => 
      e.code === "ECONNREFUSED" || e.message?.includes("ECONNREFUSED")
    ));

  if (isConnectionError) {
    // Only log once to avoid flooding the console
    if (!(redis as any)._logged_error) {
      console.warn("[Redis] Connection refused. Falling back to database.");
      (redis as any)._logged_error = true;
    }
  } else {
    console.error("[Redis] Unexpected error:", error);
  }
});

export default redis;
