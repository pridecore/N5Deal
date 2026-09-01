import { AppError } from "@/server/errors";
import { logServer } from "@/server/logger";

type Bucket = { count: number; resetAt: number };
type RateLimitOptions = { key: string; limit: number; windowMs: number };
type RateLimiter = { assert(options: RateLimitOptions): Promise<void> | void };

const buckets = new Map<string, Bucket>();
let warnedAboutMemoryFallback = false;

const memoryLimiter: RateLimiter = {
  assert({ key, limit, windowMs }: RateLimitOptions): void {
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (current.count >= limit) {
      throw new AppError("Too many requests. Please try again shortly.", 429, "RATE_LIMITED");
    }

    current.count += 1;
  },
};

const distributedPlaceholder: RateLimiter = {
  assert(options) {
    logMemoryFallback();
    memoryLimiter.assert(options);
  },
};

function logMemoryFallback() {
  if (warnedAboutMemoryFallback || process.env.NODE_ENV !== "production") return;
  warnedAboutMemoryFallback = true;
  logServer("warn", "rate_limit.memory_fallback", { distributedConfigured: Boolean(process.env.RATE_LIMIT_REDIS_URL) });
}

function getLimiter(): RateLimiter {
  if (process.env.RATE_LIMIT_REDIS_URL) return distributedPlaceholder;
  logMemoryFallback();
  return memoryLimiter;
}

export function assertRateLimit(options: RateLimitOptions): void {
  getLimiter().assert(options);
}

export function assertMemoryRateLimit({ key, limit, windowMs }: RateLimitOptions): void {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    throw new AppError("Too many requests. Please try again shortly.", 429, "RATE_LIMITED");
  }

  current.count += 1;
}

export function rateLimitKey(scope: string, identifier: string): string {
  return `${scope}:${identifier}`;
}

export function resetRateLimitsForTests(): void {
  buckets.clear();
}
