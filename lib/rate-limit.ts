interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  intervalMs?: number; // Time window in milliseconds (default: 1 minute = 60,000ms)
  maxRequests?: number; // Max requests allowed per window (default: 5)
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetTime: number } {
  const intervalMs = options.intervalMs || 60 * 1000;
  const maxRequests = options.maxRequests || 5;
  const now = Date.now();

  const record = store[identifier];

  if (!record || now > record.resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + intervalMs,
    };
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + intervalMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

export function clearRateLimitStore(): void {
  for (const key in store) {
    delete store[key];
  }
}
