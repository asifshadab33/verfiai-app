// GDELT request queue: one request at a time, at least 2 seconds apart (per worker),
// with exponential backoff and up to 3 retries on 429/503. Any failure resolves to null.
export const GDELT_SPACING_MS = 2000;
export const GDELT_MAX_RETRIES = 3;
export const GDELT_BACKOFF_BASE_MS = 1000;
export const RETRY_STATUSES = new Set([429, 503]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let tail: Promise<unknown> = Promise.resolve();
let lastStart = 0;

/** Backoff delay for retry attempt n (0-based): 1s, 2s, 4s. */
export const backoffMs = (attempt: number) => GDELT_BACKOFF_BASE_MS * 2 ** attempt;

export function gdeltFetch(
  url: string,
  init: RequestInit = {},
  deps: { fetch?: typeof fetch; sleep?: (ms: number) => Promise<unknown>; now?: () => number } = {},
): Promise<Response | null> {
  const f = deps.fetch ?? fetch,
    wait = deps.sleep ?? sleep,
    now = deps.now ?? Date.now;
  const job = tail.then(async () => {
    for (let attempt = 0; attempt <= GDELT_MAX_RETRIES; attempt++) {
      const gap = lastStart + GDELT_SPACING_MS - now();
      if (gap > 0) await wait(gap);
      lastStart = now();
      try {
        const res = await f(url, { ...init, signal: AbortSignal.timeout(5000) });
        if (!RETRY_STATUSES.has(res.status)) return res;
      } catch {
        /* timeout/network: retry */
      }
      if (attempt < GDELT_MAX_RETRIES) await wait(backoffMs(attempt));
    }
    return null;
  });
  tail = job.catch(() => null);
  return job;
}

/** Test hook. */
export const resetGdeltQueue = () => {
  tail = Promise.resolve();
  lastStart = 0;
};
