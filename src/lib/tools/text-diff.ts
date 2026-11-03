/** Word-level text comparison. Pure and bounded so a huge paste cannot freeze the browser. */
export type DiffOp = { type: "equal" | "insert" | "delete"; text: string };
export type DiffResult = {
  ops: DiffOp[];
  similarity: number;
  wordsA: number;
  wordsB: number;
  truncated: boolean;
};
export type DiffOptions = { ignoreCase?: boolean | undefined };

export const MAX_DIFF_CHARS = 200_000;
const CELL_LIMIT = 6_000_000;
const TOKEN = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*|\s+|[^\s\p{L}\p{N}]/gu;
const isSpace = (t: string) => /^\s+$/.test(t);
const isWord = (t: string) => /^[\p{L}\p{N}]/u.test(t);
const wordCount = (s: string) => (s.match(TOKEN) ?? []).filter(isWord).length;

type Step<T> = { type: "equal" | "insert" | "delete"; a?: T; b?: T };

/** Longest-common-subsequence diff with prefix/suffix trimming; null when the middle is too large. */
function diffSeq<T>(a: T[], b: T[], key: (t: T) => string): Step<T>[] | null {
  let start = 0;
  while (start < a.length && start < b.length && key(a[start]!) === key(b[start]!)) start++;
  let endA = a.length,
    endB = b.length;
  while (endA > start && endB > start && key(a[endA - 1]!) === key(b[endB - 1]!)) {
    endA--;
    endB--;
  }
  const n = endA - start,
    m = endB - start;
  if (n * m > CELL_LIMIT) return null;
  const out: Step<T>[] = [];
  for (let i = 0; i < start; i++) out.push({ type: "equal", a: a[i]!, b: b[i]! });
  if (n === 0 || m === 0) {
    for (let i = start; i < endA; i++) out.push({ type: "delete", a: a[i]! });
    for (let j = start; j < endB; j++) out.push({ type: "insert", b: b[j]! });
  } else {
    const ka = a.slice(start, endA).map(key),
      kb = b.slice(start, endB).map(key);
    const W = m + 1;
    const dp = new (n < 65535 && m < 65535 ? Uint16Array : Uint32Array)((n + 1) * W);
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--)
        dp[i * W + j] =
          ka[i] === kb[j]
            ? dp[(i + 1) * W + j + 1]! + 1
            : Math.max(dp[(i + 1) * W + j]!, dp[i * W + j + 1]!);
    let i = 0,
      j = 0;
    while (i < n && j < m) {
      if (ka[i] === kb[j]) {
        out.push({ type: "equal", a: a[start + i]!, b: b[start + j]! });
        i++;
        j++;
      } else if (dp[(i + 1) * W + j]! >= dp[i * W + j + 1]!) {
        out.push({ type: "delete", a: a[start + i]! });
        i++;
      } else {
        out.push({ type: "insert", b: b[start + j]! });
        j++;
      }
    }
    for (; i < n; i++) out.push({ type: "delete", a: a[start + i]! });
    for (; j < m; j++) out.push({ type: "insert", b: b[start + j]! });
  }
  for (let i = endA, j = endB; i < a.length; i++, j++)
    out.push({ type: "equal", a: a[i]!, b: b[j]! });
  return out;
}

export function diffText(a: string, b: string, options: DiffOptions = {}): DiffResult {
  const A = a.slice(0, MAX_DIFF_CHARS),
    B = b.slice(0, MAX_DIFF_CHARS);
  const truncated = a.length > MAX_DIFF_CHARS || b.length > MAX_DIFF_CHARS;
  const norm = options.ignoreCase ? (s: string) => s.toLowerCase() : (s: string) => s;
  const tokenKey = (t: string) => (isSpace(t) ? " " : norm(t));
  const lineKey = (l: string) => norm(l.trim().replace(/\s+/g, " "));
  const ta = A.match(TOKEN) ?? [],
    tb = B.match(TOKEN) ?? [];
  let steps = diffSeq(ta, tb, tokenKey);
  if (!steps) {
    // Very large, very different inputs: diff by line first, then by word inside changed blocks.
    const la = A.match(/[^\n]*\n|[^\n]+/g) ?? [],
      lb = B.match(/[^\n]*\n|[^\n]+/g) ?? [];
    const lines = diffSeq(la, lb, lineKey);
    if (!lines)
      steps = [
        ...la.map((l): Step<string> => ({ type: "delete", a: l })),
        ...lb.map((l): Step<string> => ({ type: "insert", b: l })),
      ];
    else {
      steps = [];
      let del: string[] = [],
        ins: string[] = [];
      const flush = () => {
        if (!del.length && !ins.length) return;
        const xa = del.join("").match(TOKEN) ?? [],
          xb = ins.join("").match(TOKEN) ?? [];
        const inner = diffSeq(xa, xb, tokenKey);
        if (inner) steps!.push(...inner);
        else {
          for (const t of xa) steps!.push({ type: "delete", a: t });
          for (const t of xb) steps!.push({ type: "insert", b: t });
        }
        del = [];
        ins = [];
      };
      for (const s of lines) {
        if (s.type === "equal") {
          flush();
          steps.push({ type: "equal", a: s.a!, b: s.b! });
        } else if (s.type === "delete") del.push(s.a!);
        else ins.push(s.b!);
      }
      flush();
    }
  }
  const ops: DiffOp[] = [];
  for (const s of steps) {
    const text =
      s.type === "equal" ? (s.b ?? s.a ?? "") : s.type === "delete" ? (s.a ?? "") : (s.b ?? "");
    if (!text) continue;
    const last = ops[ops.length - 1];
    if (last && last.type === s.type) last.text += text;
    else ops.push({ type: s.type, text });
  }
  const wordsA = wordCount(A),
    wordsB = wordCount(B);
  const equalWords = ops
    .filter((o) => o.type === "equal")
    .reduce((n, o) => n + wordCount(o.text), 0);
  const similarity = wordsA + wordsB === 0 ? 1 : Math.min(1, (2 * equalWords) / (wordsA + wordsB));
  return { ops, similarity, wordsA, wordsB, truncated };
}
