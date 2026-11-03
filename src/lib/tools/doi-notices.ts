/** Classifies Crossref update notices (including Retraction Watch data). Pure, so it is easy to test. */
export type Notice = {
  type: string;
  label?: string | undefined;
  date?: string | undefined;
  noticeDoi?: string | undefined;
};
export type Integrity =
  "retracted" | "partial_retraction" | "expression_of_concern" | "corrected" | "none";

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function isoDate(updated: unknown): string | undefined {
  const p = asRecord(updated)?.["date-parts"];
  const first = Array.isArray(p) ? p[0] : undefined;
  if (!Array.isArray(first) || !first[0]) return undefined;
  return [first[0], first[1], first[2]]
    .filter((value): value is number | string => value !== undefined && value !== null)
    .map((value, index) => (index === 0 ? String(value) : String(value).padStart(2, "0")))
    .join("-");
}

/** Merges the work's own `updated-by` list with notice records found via `filter=updates:DOI`. */
export function collectNotices(doi: string, work: unknown, noticeItems: unknown[]): Notice[] {
  const out: Notice[] = [];
  const seen = new Set<string>();
  const add = (type: unknown, label: unknown, updated: unknown, noticeDoi: unknown) => {
    const t = String(type ?? "")
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    if (!t) return;
    const nd = noticeDoi ? String(noticeDoi).toLowerCase() : "";
    if (seen.has(`${t}|${nd}`)) return;
    seen.add(`${t}|${nd}`);
    out.push({
      type: t,
      label: label ? String(label) : undefined,
      date: isoDate(updated),
      noticeDoi: nd || undefined,
    });
  };
  const updatedBy = asRecord(work)?.["updated-by"];
  for (const item of Array.isArray(updatedBy) ? updatedBy : []) {
    const u = asRecord(item);
    add(u?.["type"], u?.["label"], u?.["updated"], u?.["DOI"]);
  }
  for (const item of noticeItems ?? []) {
    const it = asRecord(item);
    for (const value of (it?.["update-to"] as unknown[] | undefined) ?? []) {
      const u = asRecord(value);
      if (String(u?.["DOI"] ?? "").toLowerCase() === doi.toLowerCase())
        add(u?.["type"], u?.["label"], u?.["updated"], it?.["DOI"]);
    }
  }
  return out;
}

export function integrityOf(title: string, notices: Notice[]): Integrity {
  const types = new Set(notices.map((n) => n.type));
  if (
    /^\s*(retracted|withdrawn)\b/i.test(title) ||
    types.has("retraction") ||
    types.has("withdrawal") ||
    types.has("removal")
  )
    return "retracted";
  if (types.has("partial_retraction")) return "partial_retraction";
  if (types.has("expression_of_concern")) return "expression_of_concern";
  if ([...types].some((t) => /^(correction|corrigendum|erratum|addendum|clarification)$/.test(t)))
    return "corrected";
  return "none";
}
