/** Classifies Crossref update notices (including Retraction Watch data). Pure, so it is easy to test. */
export type Notice = { type: string; label?: string | undefined; date?: string | undefined; noticeDoi?: string | undefined };
export type Integrity = "retracted" | "partial_retraction" | "expression_of_concern" | "corrected" | "none";

function isoDate(updated: any): string | undefined {
  const p = updated?.["date-parts"]?.[0];
  if (!Array.isArray(p) || !p[0]) return undefined;
  return [p[0], p[1], p[2]].filter(Boolean).map((v, i) => (i === 0 ? String(v) : String(v).padStart(2, "0"))).join("-");
}

/** Merges the work's own `updated-by` list with notice records found via `filter=updates:DOI`. */
export function collectNotices(doi: string, work: any, noticeItems: any[]): Notice[] {
  const out: Notice[] = [], seen = new Set<string>();
  const add = (type: unknown, label: unknown, updated: unknown, noticeDoi: unknown) => {
    const t = String(type ?? "").toLowerCase().replace(/[\s-]+/g, "_");
    if (!t) return;
    const nd = noticeDoi ? String(noticeDoi).toLowerCase() : "";
    if (seen.has(`${t}|${nd}`)) return;
    seen.add(`${t}|${nd}`);
    out.push({ type: t, label: label ? String(label) : undefined, date: isoDate(updated), noticeDoi: nd || undefined });
  };
  for (const u of work?.["updated-by"] ?? []) add(u?.type, u?.label, u?.updated, u?.DOI);
  for (const it of noticeItems ?? []) for (const u of it?.["update-to"] ?? []) if (String(u?.DOI ?? "").toLowerCase() === doi.toLowerCase()) add(u?.type, u?.label, u?.updated, it?.DOI);
  return out;
}

export function integrityOf(title: string, notices: Notice[]): Integrity {
  const types = new Set(notices.map(n => n.type));
  if (/^\s*(retracted|withdrawn)\b/i.test(title) || types.has("retraction") || types.has("withdrawal") || types.has("removal")) return "retracted";
  if (types.has("partial_retraction")) return "partial_retraction";
  if (types.has("expression_of_concern")) return "expression_of_concern";
  if ([...types].some(t => /^(correction|corrigendum|erratum|addendum|clarification)$/.test(t))) return "corrected";
  return "none";
}
