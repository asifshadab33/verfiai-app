import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileSearch, LoaderCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { lookupDois, type DoiLookupItem } from "@/lib/tools.functions";
import { extractDois } from "@/lib/tools/doi";
import { ToolSignInPrompt } from "./ToolSignInPrompt";

const SAMPLE =
  "10.1016/S0140-6736(97)11096-0\n10.1038/nature14539\n10.1000/this-doi-does-not-exist-123";
const BAD = "bg-danger-soft text-destructive border-destructive/30";
const WARN = "bg-warning-soft text-warning border-warning/40";
const BADGE: Record<string, { label: string; cls: string }> = {
  retracted: { label: "Retracted", cls: BAD },
  partial_retraction: { label: "Partially retracted", cls: WARN },
  expression_of_concern: { label: "Expression of concern", cls: WARN },
  corrected: { label: "Has a correction", cls: "bg-secondary text-foreground border-border" },
  none: { label: "No notices found", cls: "bg-success-soft text-success border-success/30" },
  not_found: { label: "DOI not found", cls: WARN },
  unreachable: {
    label: "Could not check",
    cls: "bg-secondary text-muted-foreground border-border",
  },
};
const badgeFor = (i: DoiLookupItem) =>
  BADGE[i.record.status === "found" ? i.record.integrity : i.record.status]!;

export function DoiChecker() {
  const lookup = useServerFn(lookupDois);
  const { user, loading } = useAuth();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<DoiLookupItem[] | null>(null);
  const found = useMemo(() => extractDois(text, 10), [text]);
  async function run() {
    if (!user || loading || !found.dois.length || busy) return;
    setBusy(true);
    setError("");
    setItems(null);
    try {
      setItems((await lookup({ data: { dois: found.dois } })).items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p role="status">Checking your sign-in…</p>;
  if (!user) return <ToolSignInPrompt tool="the DOI and retraction checker" />;

  return (
    <section
      aria-label="DOI and retraction checker"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8"
    >
      <label htmlFor="doi-text" className="block text-sm font-semibold">
        DOIs or a reference list
      </label>
      <Textarea
        id="doi-text"
        dir="auto"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={20000}
        className="mt-2 min-h-36 bg-background"
        placeholder="10.1038/nature14539"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <button type="button" className="text-brand underline" onClick={() => setText(SAMPLE)}>
          Try an example
        </button>
        <span>
          {found.total === 0
            ? "No DOI found yet"
            : `${found.total} DOI${found.total === 1 ? "" : "s"} found${found.total > 10 ? "; the first 10 will be checked" : ""}`}
        </span>
      </div>
      <div className="mt-4">
        <Button type="button" size="lg" onClick={run} disabled={!found.dois.length || busy}>
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <FileSearch className="size-4" />
          )}
          {busy ? "Checking…" : "Check DOIs"}
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
      {items && (
        <ul className="mt-6 space-y-4" aria-label="Results">
          {items.map((i) => {
            const b = badgeFor(i),
              r = i.record;
            return (
              <li key={r.doi} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <a
                    href={`https://doi.org/${r.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-brand underline [overflow-wrap:anywhere]"
                  >
                    {r.doi}
                  </a>
                  <span
                    className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${b.cls}`}
                  >
                    {b.label}
                  </span>
                </div>
                {r.title && (
                  <p className="mt-2 font-semibold [overflow-wrap:anywhere]">{r.title}</p>
                )}
                {(r.journal || r.year || r.citedBy !== undefined) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[r.journal, r.year, r.citedBy !== undefined ? `cited by ${r.citedBy}` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {r.status === "found" && r.source === "doi.org" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    This DOI is registered, but the registry shares no further details here.
                  </p>
                )}
                {r.status === "not_found" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No registry we checked knows this DOI. Check for a typo; a very new DOI may also
                    not appear yet.
                  </p>
                )}
                {r.status === "unreachable" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    The registries did not respond. Try again in a moment.
                  </p>
                )}
                {r.notices.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {r.notices.map((n) => (
                      <li
                        key={`${n.type}-${n.noticeDoi ?? ""}`}
                        className="rounded-lg border border-border bg-card p-2"
                      >
                        <strong>{n.label ?? n.type.replace(/_/g, " ")}</strong>
                        {n.date ? ` · ${n.date}` : ""}
                        {n.noticeDoi && (
                          <>
                            {" "}
                            ·{" "}
                            <a
                              className="text-brand underline [overflow-wrap:anywhere]"
                              href={`https://doi.org/${n.noticeDoi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              notice
                            </a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {i.openAccess && (
                  <p className="mt-3 text-sm">
                    Free full text:{" "}
                    <a
                      className="text-brand underline"
                      href={i.openAccess.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      open copy{i.openAccess.version ? ` (${i.openAccess.version})` : ""}
                    </a>
                    {i.openAccess.pdf && (
                      <>
                        {" "}
                        ·{" "}
                        <a
                          className="text-brand underline"
                          href={i.openAccess.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          PDF
                        </a>
                      </>
                    )}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {items && (
        <p className="mt-4 text-xs text-muted-foreground">
          “No notices found” means none of the sources we checked lists one. It does not prove a
          paper is sound, and new notices can take days to appear.
        </p>
      )}
    </section>
  );
}
