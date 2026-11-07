/** Bucket ISO timestamps into a zero-filled daily series (UTC) covering the last `days` days. */
export function dailySeries(timestamps: string[], days: number, now = Date.now()) {
  const out: { date: string; count: number }[] = [];
  const idx = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 864e5).toISOString().slice(0, 10);
    idx.set(date, out.length);
    out.push({ date, count: 0 });
  }
  for (const t of timestamps) {
    const i = idx.get(t.slice(0, 10));
    if (i !== undefined) out[i].count++;
  }
  return out;
}

