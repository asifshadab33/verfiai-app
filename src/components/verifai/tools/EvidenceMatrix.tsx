import { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Stance = "supports" | "contradicts" | "mixed" | "unclear";

type EvidenceEntry = {
  id: number;
  source: string;
  stance: Stance;
  excerpt: string;
  notes: string;
};

const MAX_SOURCES = 20;
const MAX_CLAIM_LENGTH = 2_000;
const MAX_SOURCE_LENGTH = 300;
const MAX_TEXT_LENGTH = 5_000;

const STANCES: { value: Stance; label: string }[] = [
  { value: "supports", label: "Supports the claim" },
  { value: "contradicts", label: "Contradicts the claim" },
  { value: "mixed", label: "Mixed or partial" },
  { value: "unclear", label: "Does not address it clearly" },
];

function isStance(value: string): value is Stance {
  return STANCES.some((stance) => stance.value === value);
}

function csvCell(value: string) {
  const safeValue = /^[\s]*[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

function downloadCsv(claim: string, entries: EvidenceEntry[]) {
  const rows = [
    ["Claim", "Source", "Evidence assessment", "Excerpt", "Notes"],
    ...entries.map((entry) => [
      claim,
      entry.source,
      STANCES.find((stance) => stance.value === entry.stance)?.label ?? entry.stance,
      entry.excerpt,
      entry.notes,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "verifai-evidence-matrix.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function EvidenceMatrix() {
  const [claim, setClaim] = useState("");
  const [entries, setEntries] = useState<EvidenceEntry[]>([
    { id: 1, source: "", stance: "unclear", excerpt: "", notes: "" },
  ]);
  const [nextId, setNextId] = useState(2);

  function updateEntry(id: number, patch: Partial<Omit<EvidenceEntry, "id">>) {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );
  }

  function addEntry() {
    setEntries((current) => [
      ...current,
      { id: nextId, source: "", stance: "unclear", excerpt: "", notes: "" },
    ]);
    setNextId((id) => id + 1);
  }

  const filledEntries = entries.filter((entry) =>
    [entry.source, entry.excerpt, entry.notes].some((value) => value.trim()),
  );

  return (
    <section aria-label="Claim evidence matrix" className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
        <label htmlFor="evidence-claim" className="block text-sm font-semibold">
          Claim to examine
        </label>
        <Textarea
          id="evidence-claim"
          dir="auto"
          value={claim}
          onChange={(event) => setClaim(event.target.value)}
          maxLength={MAX_CLAIM_LENGTH}
          placeholder="Write one specific, checkable claim"
          className="mt-2 min-h-24 bg-background"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {claim.length.toLocaleString()} / {MAX_CLAIM_LENGTH.toLocaleString()}
        </p>
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <fieldset
            key={entry.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
          >
            <legend className="px-1 font-display text-base font-bold">Source {index + 1}</legend>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor={`evidence-source-${entry.id}`}
                  className="block text-sm font-semibold"
                >
                  Source name or link
                </label>
                <input
                  id={`evidence-source-${entry.id}`}
                  value={entry.source}
                  onChange={(event) => updateEntry(entry.id, { source: event.target.value })}
                  maxLength={MAX_SOURCE_LENGTH}
                  placeholder="Publication, author, URL, or document title"
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor={`evidence-stance-${entry.id}`}
                  className="block text-sm font-semibold"
                >
                  How does it relate to the claim?
                </label>
                <select
                  id={`evidence-stance-${entry.id}`}
                  value={entry.stance}
                  onChange={(event) => {
                    if (isStance(event.target.value)) {
                      updateEntry(entry.id, { stance: event.target.value });
                    }
                  }}
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {STANCES.map((stance) => (
                    <option key={stance.value} value={stance.value}>
                      {stance.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor={`evidence-excerpt-${entry.id}`}
                  className="block text-sm font-semibold"
                >
                  Relevant excerpt
                </label>
                <Textarea
                  id={`evidence-excerpt-${entry.id}`}
                  dir="auto"
                  value={entry.excerpt}
                  onChange={(event) => updateEntry(entry.id, { excerpt: event.target.value })}
                  maxLength={MAX_TEXT_LENGTH}
                  placeholder="Paste the passage that bears on the claim"
                  className="mt-2 min-h-28 bg-background"
                />
              </div>
              <div>
                <label
                  htmlFor={`evidence-notes-${entry.id}`}
                  className="block text-sm font-semibold"
                >
                  Context or questions
                </label>
                <Textarea
                  id={`evidence-notes-${entry.id}`}
                  dir="auto"
                  value={entry.notes}
                  onChange={(event) => updateEntry(entry.id, { notes: event.target.value })}
                  maxLength={MAX_TEXT_LENGTH}
                  placeholder="Note limitations, date, methods, or what still needs checking"
                  className="mt-2 min-h-28 bg-background"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setEntries((current) => current.filter((item) => item.id !== entry.id))
                }
                aria-label={`Remove source ${index + 1}`}
              >
                <Trash2 aria-hidden="true" />
                Remove source
              </Button>
            </div>
          </fieldset>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={addEntry}
          disabled={entries.length >= MAX_SOURCES}
        >
          <Plus aria-hidden="true" />
          Add source
        </Button>
        <Button
          type="button"
          onClick={() => downloadCsv(claim, filledEntries)}
          disabled={!claim.trim() || filledEntries.length === 0}
        >
          <Download aria-hidden="true" />
          Download CSV
        </Button>
        <p className="self-center text-xs text-muted-foreground">
          {entries.length} of {MAX_SOURCES} sources
        </p>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        The assessment is your own reading of each source, not a system-generated verdict.
      </p>
    </section>
  );
}
