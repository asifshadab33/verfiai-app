import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { diffText, MAX_DIFF_CHARS, type DiffResult } from "@/lib/tools/text-diff";
import { wordsOf } from "@/lib/tools/text-stats";

export function TextCompare() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [r, setR] = useState<DiffResult | null>(null);
  const count = (type: "insert" | "delete") => (r ? wordsOf(r.ops.filter(o => o.type === type).map(o => o.text).join(" ")).length : 0);
  const compare = () => setR(diffText(a, b, { ignoreCase }));
  return <section aria-label="Text compare" className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
    <div className="grid gap-4 md:grid-cols-2">
      <div><label htmlFor="tc-a" className="block text-sm font-semibold">Original text</label><Textarea id="tc-a" dir="auto" value={a} onChange={e => { setA(e.target.value); setR(null); }} maxLength={MAX_DIFF_CHARS} className="mt-2 min-h-48 bg-background" /></div>
      <div><label htmlFor="tc-b" className="block text-sm font-semibold">Changed text</label><Textarea id="tc-b" dir="auto" value={b} onChange={e => { setB(e.target.value); setR(null); }} maxLength={MAX_DIFF_CHARS} className="mt-2 min-h-48 bg-background" /></div>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <Button type="button" onClick={compare} disabled={!a && !b}>Compare</Button>
      <Button type="button" variant="outline" onClick={() => { setA(b); setB(a); setR(null); }}><ArrowLeftRight className="size-4" />Swap</Button>
      <Button type="button" variant="outline" onClick={() => { setA(""); setB(""); setR(null); }} disabled={!a && !b}>Clear</Button>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ignoreCase} onChange={e => { setIgnoreCase(e.target.checked); setR(null); }} className="size-4 accent-primary" />Ignore capital letters</label>
    </div>
    {r && <div className="mt-6" role="region" aria-label="Comparison result">
      <p className="text-sm"><strong>{Math.round(r.similarity * 100)}% similar</strong> · {count("insert").toLocaleString()} words added · {count("delete").toLocaleString()} words removed</p>
      {r.truncated && <p role="status" className="mt-2 text-xs text-muted-foreground">Only the first {MAX_DIFF_CHARS.toLocaleString()} characters of each text were compared.</p>}
      <p className="mt-3 text-xs text-muted-foreground"><del className="rounded bg-danger-soft px-1 text-destructive">removed</del> <ins className="rounded bg-success-soft px-1 text-success underline">added</ins> · unchanged text is plain.</p>
      <div dir="auto" className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm leading-7 [overflow-wrap:anywhere]">
        {r.ops.map((o, i) => o.type === "equal" ? <span key={i}>{o.text}</span> : o.type === "delete" ? <del key={i} className="rounded bg-danger-soft text-destructive"><span className="sr-only">removed: </span>{o.text}</del> : <ins key={i} className="rounded bg-success-soft text-success"><span className="sr-only">added: </span>{o.text}</ins>)}
      </div>
    </div>}
  </section>;
}
