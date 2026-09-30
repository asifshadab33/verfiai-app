import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

type MockSource = {
  title: string;
  publisher: string;
  url: string;
  retrievalDate: string;
} & ({ relationship: "Direct Support"; quote: string } | { relationship: "Partial Support" | "Mention Only" | "Insufficient Evidence"; quote?: never });

// The illustrative report never labels an unchecked link as direct evidence.
function generateMockReport(): { topic: string; sources: MockSource[] } {
  return {
    topic: "Does daily coffee affect sleep quality?",
    sources: [
      { title: "Caffeine Effects on Sleep Taken 0, 3, or 6 Hours before Going to Bed", publisher: "Journal of Clinical Sleep Medicine", url: "https://doi.org/10.5664/jcsm.3170", retrievalDate: "Not retrieved (demo)", relationship: "Mention Only" },
      { title: "About Sleep", publisher: "Centers for Disease Control and Prevention", url: "https://www.cdc.gov/sleep/about/index.html", retrievalDate: "Not retrieved (demo)", relationship: "Insufficient Evidence" },
    ],
  };
}

export const Route = createFileRoute("/sample-report")({ head: () => ({ meta: [{ title: "Illustrative sample report | Verfi AI" }, { name: "description", content: "Preview the structure of a Verfi AI report. All sample content is illustrative, not research." }, { property: "og:title", content: "Illustrative sample report | Verfi AI" }, { property: "og:description", content: "See the structure of a report with findings, source links and limitations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Sample });

function Sample() {
  const report = generateMockReport();
  return <ContentPage title="What a report looks like" intro="Illustrative example only — this is placeholder content, not a completed study or verified analysis.">
    <p className="mb-9 border-l-2 border-primary bg-secondary p-4 text-sm font-semibold">Example topic: {report.topic}</p>
    <PageSection title="Executive summary"><p>A finished report opens with a concise answer, the strength of available evidence and what remains uncertain. This sample contains no research conclusions.</p></PageSection>
    <PageSection title="Key findings"><p>Each finding appears with a status: sourced, inference, disputed or unverified. The report distinguishes source material from AI synthesis.</p></PageSection>
    <PageSection title="Methodology and limitations"><p>This illustrative report does not browse or scrape live websites. Its example links and relationship labels are not verified research findings.</p></PageSection>
    <section aria-labelledby="sample-sources-title" className="border-t border-border py-8">
      <h2 id="sample-sources-title" className="font-display text-xl font-bold">Sources &amp; Evidence</h2>
      <div role="alert" className="mt-4 border-l-4 border-warning bg-warning-soft p-4 text-sm font-semibold text-foreground">
        <p>⚠️ AI-generated citations should be independently verified. We do not scrape live websites in this demo.</p>
      </div>
      <ol className="mt-5 max-w-3xl list-decimal space-y-6 pl-6 text-sm leading-7">
        {report.sources.map(source => <li key={source.url} className="pl-1">
          <h3 className="font-semibold text-foreground">{source.title} <span className="font-normal text-muted-foreground">— {source.publisher}</span></h3>
          <dl className="mt-1 text-muted-foreground">
            <div><dt className="inline font-semibold text-foreground">URL: </dt><dd className="inline"><a href={source.url} target="_blank" rel="noopener noreferrer" className="break-all text-brand underline">{source.url}</a></dd></div>
            <div><dt className="inline font-semibold text-foreground">Retrieval Date: </dt><dd className="inline">{source.retrievalDate}</dd></div>
            <div><dt className="inline font-semibold text-foreground">Relationship: </dt><dd className="inline">{source.relationship}</dd></div>
            {source.relationship === "Direct Support" && <div><dt className="inline font-semibold text-foreground">Quote: </dt><dd className="inline">“{source.quote}”</dd></div>}
          </dl>
        </li>)}
      </ol>
    </section>
    <Link to="/" className="mt-6 inline-block font-semibold text-brand underline">Generate your own report →</Link>
  </ContentPage>;
}
