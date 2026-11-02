import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cleanText, convertCase, type CaseMode, type CleanOptions } from "@/lib/tools/text-clean";
import { CopyButton } from "./CopyButton";

const CASES: [CaseMode, string][] = [["none", "Keep as is"], ["upper", "UPPER CASE"], ["lower", "lower case"], ["title", "Title Case"], ["sentence", "Sentence case"], ["camel", "camelCase"], ["snake", "snake_case"], ["kebab", "kebab-case"]];
const OPTIONS: [keyof CleanOptions, string][] = [
  ["removeInvisible", "Remove hidden characters (zero-width, soft hyphen)"], ["straightenQuotes", "Straighten curly quotes"], ["trimLines", "Trim spaces at line starts and ends"],
  ["collapseSpaces", "Collapse repeated spaces"], ["unwrapLines", "Join hard-wrapped lines into paragraphs"], ["fixHyphenation", "Repair words split across lines (exam-⏎ple)"], ["removeDuplicateLines", "Remove duplicate lines"],
];

export function TextCleaner() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<CaseMode>("none");
  const [opts, setOpts] = useState<CleanOptions>({ removeInvisible: true, collapseSpaces: true, trimLines: true });
  const [blank, setBlank] = useState<"keep" | "collapse" | "remove">("keep");
  const out = useMemo(() => convertCase(cleanText(text, { ...opts, blankLines: blank }), mode), [text, opts, blank, mode]);
  return <section aria-label="Text cleaner" className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
    <label htmlFor="tcl-in" className="block text-sm font-semibold">Your text</label>
    <Textarea id="tcl-in" dir="auto" value={text} onChange={e => setText(e.target.value)} maxLength={300000} className="mt-2 min-h-40 bg-background" placeholder="Paste text copied from a PDF or web page…" />
    <div className="mt-5 grid gap-6 md:grid-cols-2">
      <fieldset><legend className="text-sm font-semibold">Clean up</legend>
        <div className="mt-2 space-y-2 text-sm">{OPTIONS.map(([k, label]) => <label key={k} className="flex items-start gap-2"><input type="checkbox" checked={!!opts[k]} onChange={e => setOpts(o => ({ ...o, [k]: e.target.checked }))} className="mt-1 size-4 accent-primary" />{label}</label>)}</div>
        <div className="mt-3 text-sm"><label htmlFor="tcl-blank" className="font-semibold">Blank lines</label>
          <select id="tcl-blank" value={blank} onChange={e => setBlank(e.target.value as typeof blank)} className="ms-2 h-9 rounded-md border border-input bg-background px-2 text-sm"><option value="keep">Keep</option><option value="collapse">Collapse to one</option><option value="remove">Remove all</option></select></div>
      </fieldset>
      <fieldset><legend className="text-sm font-semibold">Change case</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">{CASES.map(([v, label]) => <label key={v} className="flex items-center gap-2"><input type="radio" name="tcl-case" checked={mode === v} onChange={() => setMode(v)} className="size-4 accent-primary" />{label}</label>)}</div>
      </fieldset>
    </div>
    <div className="mt-6"><label htmlFor="tcl-out" className="block text-sm font-semibold">Result</label>
      <Textarea id="tcl-out" dir="auto" readOnly value={out} className="mt-2 min-h-40 bg-background" />
      <div className="mt-2 flex flex-wrap items-center gap-3"><CopyButton text={out} label="Copy result" /><Button type="button" size="sm" variant="outline" onClick={() => setText("")} disabled={!text}>Clear</Button><span className="text-xs text-muted-foreground">{out.length.toLocaleString()} characters</span></div>
    </div>
  </section>;
}
