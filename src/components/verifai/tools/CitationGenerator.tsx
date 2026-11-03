import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, LoaderCircle, Quote, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDois } from "@/lib/tools.functions";
import { CITATION_STYLES, type CitationStyleId } from "@/lib/tools/cite-format";
import { extractDois } from "@/lib/tools/doi";
import { CopyButton } from "./CopyButton";

const SAMPLE = "10.1038/nature14539\n10.1126/science.169.3946.635";

export function CitationGenerator() {
  const format = useServerFn(formatDois);
  const [text, setText] = useState("");
  const [style, setStyle] = useState<CitationStyleId>("apa");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [out, setOut] = useState<{
    lines: string[];
    failed: { doi: string; error: string }[];
    style: string;
  } | null>(null);
  const found = useMemo(() => extractDois(text, 10), [text]);
  async function run() {
    if (!found.dois.length || busy) return;
    setBusy(true);
    setError("");
    setOut(null);
    try {
      const r = await format({ data: { dois: found.dois, style } });
      setOut({
        lines: r.lines,
        failed: r.items.flatMap((i) => (i.ok ? [] : [{ doi: i.doi, error: i.error }])),
        style: r.style,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function download() {
    if (!out) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([out.lines.join("\n\n")], { type: "text/plain;charset=utf-8" }),
    );
    a.download = `references-${out.style}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  const all = out ? out.lines.join("\n\n") : "";
  return (
    <section
      aria-label="Citation generator"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8"
    >
      <label htmlFor="cg-text" className="block text-sm font-semibold">
        DOIs (one per line, or paste a reference list)
      </label>
      <Textarea
        id="cg-text"
        dir="auto"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={20000}
        className="mt-2 min-h-32 bg-background"
        placeholder="10.1038/nature14539"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <button type="button" className="text-brand underline" onClick={() => setText(SAMPLE)}>
          Try an example
        </button>
        <span>
          {found.total === 0
            ? "No DOI found yet"
            : `${found.total} DOI${found.total === 1 ? "" : "s"} found${found.total > 10 ? "; the first 10 will be formatted" : ""}`}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="cg-style" className="block text-sm font-semibold">
            Style
          </label>
          <select
            id="cg-style"
            value={style}
            onChange={(e) => setStyle(e.target.value as CitationStyleId)}
            className="mt-1 h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            {CITATION_STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" size="lg" onClick={run} disabled={!found.dois.length || busy}>
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Quote className="size-4" />}
          {busy ? "Formatting…" : "Create references"}
        </Button>
      </div>
      {error && (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-danger-soft p-4 text-sm text-destructive"
        >
          <XCircle className="size-4" />
          {error}
          <Button size="sm" variant="outline" onClick={run}>
            Try again
          </Button>
        </div>
      )}
      {out && (
        <div className="mt-6" role="region" aria-label="References">
          {out.lines.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <CopyButton text={all} label="Copy all" />
                <Button type="button" size="sm" variant="outline" onClick={download}>
                  <Download className="size-4" />
                  Download .txt
                </Button>
              </div>
              <ol className="mt-4 space-y-3">
                {out.lines.map((l, i) => (
                  <li key={i} className="rounded-xl border border-border bg-background p-3 text-sm">
                    <p className="[overflow-wrap:anywhere]">{l}</p>
                    <div className="mt-2">
                      <CopyButton text={l} />
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
          {out.failed.length > 0 && (
            <div className="mt-4 rounded-xl bg-warning-soft p-4 text-sm">
              <h3 className="font-semibold">Could not format</h3>
              <ul className="mt-1 space-y-1">
                {out.failed.map((f) => (
                  <li key={f.doi}>
                    <span className="[overflow-wrap:anywhere]">{f.doi}</span>: {f.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            References come from registry metadata, which can be incomplete. Italics are not
            preserved in plain text, so journal and book titles may need italics in your document.
            Check capitalisation, author names and page numbers against your style guide.
          </p>
        </div>
      )}
    </section>
  );
}
