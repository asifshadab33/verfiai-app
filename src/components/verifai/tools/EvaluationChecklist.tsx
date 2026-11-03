import { Button } from "@/components/ui/button";

const prompts = [
  "Who created or published this source? Can you verify their identity and relevant expertise?",
  "What evidence supports the main claim? Can you find and inspect the original source?",
  "When was it published or updated, and is that date appropriate for the topic?",
  "What is the source's purpose, funding or potential conflict of interest?",
  "Does it distinguish evidence from opinion and explain uncertainty or limitations?",
  "Can independent, credible sources corroborate the key facts?",
  "Have you checked the headline against the full text and its context?",
];

export function EvaluationChecklist() {
  return (
    <>
      <style>{`
        @media print {
          body:has(.evaluation-checklist-page) {
            background: #fff !important;
            color: #000 !important;
          }
          body:has(.evaluation-checklist-page) .min-h-screen {
            background: #fff !important;
            color: #000 !important;
          }
          body:has(.evaluation-checklist-page) header,
          body:has(.evaluation-checklist-page) #main-content > div > a,
          body:has(.evaluation-checklist-page) #main-content > div > h1,
          body:has(.evaluation-checklist-page) #main-content > div > p,
          body:has(.evaluation-checklist-page) #main-content > div > div > .tool-page-content > p,
          body:has(.evaluation-checklist-page) #main-content > div > div > section {
            display: none !important;
          }
          body:has(.evaluation-checklist-page) #main-content > div {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .evaluation-checklist-page,
          .evaluation-checklist-page * {
            color: #000 !important;
            box-shadow: none !important;
          }
          .evaluation-checklist-page {
            background: #fff !important;
          }
          .evaluation-checklist-page section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .evaluation-checklist-page .mb-6 {
            margin-bottom: 1rem !important;
          }
          .evaluation-checklist-page .worksheet-line {
            min-height: 2rem;
            border-bottom: 1px solid #777;
          }
        }
      `}</style>
      <div className="evaluation-checklist-page rounded-lg border border-border bg-card p-5 text-foreground print:border-0 print:bg-white print:p-0 print:text-black">
        <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
          <p className="text-sm text-muted-foreground">
            Use this worksheet to record what you checked. It does not assign a credibility score.
          </p>
          <Button onClick={() => window.print()}>Print checklist</Button>
        </div>
        <section className="mb-6">
          <h2 className="font-display text-lg font-bold">Source details</h2>
          {["Source / publication", "Author", "Title or claim", "URL", "Date reviewed"].map(
            (label) => (
              <div key={label} className="mt-3 grid gap-1 sm:grid-cols-[10rem_1fr]">
                <span className="text-sm font-medium">{label}</span>
                <div className="worksheet-line min-h-8 border-b border-border" aria-hidden="true" />
              </div>
            ),
          )}
        </section>
        <section className="mb-6">
          <h2 className="font-display text-lg font-bold">Evaluation questions</h2>
          <ol className="mt-3 space-y-3">
            {prompts.map((prompt) => (
              <li key={prompt} className="flex items-start gap-3">
                <span
                  className="mt-1 inline-block size-4 shrink-0 border border-current"
                  aria-hidden="true"
                />
                <span>{prompt}</span>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold">Notes and follow-up checks</h2>
          <p className="mt-2 text-sm">
            What evidence did you find? What remains uncertain, and what will you verify next?
          </p>
          <div className="mt-3 space-y-6" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="worksheet-line border-b border-border" />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
