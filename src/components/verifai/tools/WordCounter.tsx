import { useDeferredValue, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { textStats } from "@/lib/tools/text-stats";

const band = (n: number) => (n >= 90 ? "very easy" : n >= 80 ? "easy" : n >= 70 ? "fairly easy" : n >= 60 ? "plain English" : n >= 50 ? "fairly difficult" : n >= 30 ? "difficult" : "very difficult");
const mins = (n: number) => (n < 1 ? "under 1 min" : `${Math.round(n)} min`);

export function WordCounter() {
  const [text, setText] = useState("");
  const deferred = useDeferredValue(text);
  const s = useMemo(() => textStats(deferred), [deferred]);
  const cards: [string, string][] = [
    ["Words", s.words.toLocaleString()], ["Characters", s.characters.toLocaleString()], ["Characters (no spaces)", s.charactersNoSpaces.toLocaleString()],
    ["Sentences", s.sentences.toLocaleString()], ["Paragraphs", s.paragraphs.toLocaleString()], ["Reading time", mins(s.readingMinutes)],
    ["Speaking time", mins(s.speakingMinutes)], ["Words per sentence", String(s.averageSentenceWords)],
  ];
  return <section aria-label="Word counter" className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
    <label htmlFor="wc-text" className="block text-sm font-semibold">Your text</label>
    <Textarea id="wc-text" dir="auto" value={text} onChange={e => setText(e.target.value)} maxLength={500000} className="mt-2 min-h-56 bg-background" placeholder="Paste or type here…" />
    <div className="mt-2 flex justify-end"><Button type="button" size="sm" variant="outline" onClick={() => setText("")} disabled={!text}>Clear</Button></div>
    <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([k, v]) => <div key={k} className="rounded-xl border border-border bg-background p-4"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-1 font-display text-2xl font-extrabold">{v}</dd></div>)}</dl>
    {s.fleschReadingEase !== null && <p className="mt-4 text-sm">Reading ease (English only): <strong>{s.fleschReadingEase}</strong> out of 100, {band(s.fleschReadingEase)}. Higher is easier to read.</p>}
    {s.topWords.length > 0 && <div className="mt-4"><h3 className="text-sm font-semibold">Most repeated words</h3><ul className="mt-2 flex flex-wrap gap-2 text-sm">{s.topWords.map(w => <li key={w.word} className="rounded-full border border-border bg-background px-3 py-1">{w.word} <span className="text-muted-foreground">×{w.count}</span></li>)}</ul></div>}
  </section>;
}
