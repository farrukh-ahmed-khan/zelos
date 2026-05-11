import { ApiError } from "@/lib/http";

const hits = new Map<string, number[]>();

export function enforceRateLimit(key: string, limit = 12, windowMs = 60_000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recentHits = (hits.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (recentHits.length >= limit) {
    throw new ApiError(429, "Too many requests. Please try again shortly.");
  }

  recentHits.push(now);
  hits.set(key, recentHits);
}
