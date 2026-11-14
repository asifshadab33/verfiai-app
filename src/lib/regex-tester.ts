export const REGEX_MAX_PATTERN_LENGTH = 1_000;
export const REGEX_MAX_INPUT_LENGTH = 100 * 1024;
export const REGEX_EXECUTION_TIMEOUT_MS = 200;

export type RegexMatch = { value: string; index: number };
type WorkerResult =
  | { ok: true; matches: RegexMatch[] }
  | { ok: false; error: string };
type WorkerLike = Pick<Worker, "postMessage" | "terminate"> & {
  onmessage: ((event: MessageEvent<WorkerResult>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  onmessageerror?: ((event: MessageEvent) => void) | null;
};
type WorkerFactory = () => WorkerLike;

export function validateRegexInput(pattern: string, input: string) {
  if (pattern.length > REGEX_MAX_PATTERN_LENGTH)
    throw new Error("Regular expression must be 1,000 characters or fewer.");
  if (input.length > REGEX_MAX_INPUT_LENGTH)
    throw new Error("Test text must be 100 KB or smaller.");
}

function createRegexWorker(): WorkerLike {
  return new Worker(new URL("./regex-tester.worker.ts", import.meta.url), {
    type: "module",
  });
}

export function runRegexInWorker(
  pattern: string,
  input: string,
  flags: string,
  timeoutMs = REGEX_EXECUTION_TIMEOUT_MS,
  workerFactory: WorkerFactory = createRegexWorker,
): Promise<RegexMatch[]> {
  validateRegexInput(pattern, input);
  if (!/^(?!.*(.).*\1)[dgimsuvy]*$/.test(flags) || (flags.includes("u") && flags.includes("v")))
    throw new Error("Use valid, non-repeated regular expression flags.");
  const deadline = Number.isFinite(timeoutMs)
    ? Math.max(1, Math.min(REGEX_EXECUTION_TIMEOUT_MS, timeoutMs))
    : REGEX_EXECUTION_TIMEOUT_MS;
  return new Promise((resolve, reject) => {
    let worker: WorkerLike;
    try {
      worker = workerFactory();
    } catch {
      reject(new Error("This browser could not start the safe regex tester."));
      return;
    }
    let settled = false;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      try { worker.terminate(); } finally { callback(); }
    };
    timer = setTimeout(
      () => finish(() => reject(new Error("Pattern is too complex to run safely. Try a simpler pattern."))),
      deadline,
    );
    worker.onmessage = (event) => {
      const result = event.data;
      finish(() => {
        if (result.ok) resolve(result.matches);
        else reject(new Error(result.error));
      });
    };
    worker.onerror = () =>
      finish(() => reject(new Error("Pattern is too complex to run safely. Try a simpler pattern.")));
    worker.onmessageerror = () =>
      finish(() => reject(new Error("This browser could not read the regex result.")));
    try { worker.postMessage({ pattern, input, flags }); }
    catch { finish(() => reject(new Error("This browser could not start the safe regex tester."))); }
  });
}
