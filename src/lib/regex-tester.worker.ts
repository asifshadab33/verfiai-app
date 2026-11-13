/// <reference lib="webworker" />
type RegexWorkerRequest = { pattern: string; input: string; flags: string };
const context = self as DedicatedWorkerGlobalScope;

context.onmessage = (event: MessageEvent<RegexWorkerRequest>) => {
  const { pattern, input, flags } = event.data;
  try {
    const safeFlags = flags.includes("g") ? flags : flags + "g";
    const expression = new RegExp(pattern, safeFlags);
    const matches: { value: string; index: number }[] = [];
    let match: RegExpExecArray | null;
    while ((match = expression.exec(input)) !== null) {
      matches.push({ value: match[0], index: match.index });
      if (matches.length >= 1000) break;
      if (match[0] === "") {
        const index = expression.lastIndex;
        const code = input.codePointAt(index);
        expression.lastIndex += (safeFlags.includes("u") || safeFlags.includes("v")) && code !== undefined && code > 0xffff ? 2 : 1;
      }
    }
    context.postMessage({ ok: true, matches });
  } catch (error) {
    context.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : "Invalid regular expression.",
    });
  }
};
