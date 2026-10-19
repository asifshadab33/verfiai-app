import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportView } from "@/components/verifai/ReportView";
import { getSharedReport } from "@/lib/share.functions";
import type { ResearchReport } from "@/lib/report.functions";
import { ReportSharingBadge } from "@/components/verifai/ReportSharingBadge";

export const Route = createFileRoute("/r/$token")({
  loader: async ({ params }) => {
    const row = await getSharedReport({ data: { token: params.token } }).catch(() => null);
    if (!row) throw notFound();
    return row;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Report unavailable | Verfiai" }, { name: "robots", content: "noindex" }, { name: "description", content: "This shared Verfiai report is unavailable or no longer shared." }, { property: "og:title", content: "Report unavailable | Verfiai" }, { property: "og:description", content: "This shared Verfiai report is unavailable or no longer shared." }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }] };
    const r = loaderData.content as ResearchReport;
    const title = `${loaderData.title} | Verfiai report`;
    const description = (r.summary ?? "").replace(/\s+/g, " ").slice(0, 155);
    return { meta: [
      { title }, { name: "description", content: description }, { name: "robots", content: "noindex" },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  notFoundComponent: SharedNotFound,
  component: SharedReport,
});

function Brand() {
  return <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold"><span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><FileCheck2 className="size-5" /></span>Verfiai</Link>;
}

function SharedNotFound() {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center"><Brand /><h1 className="font-display text-2xl font-bold">This report isn't available</h1><p className="text-muted-foreground">The link may be wrong, or the owner stopped sharing it.</p><Button asChild><Link to="/">Go to Verfiai</Link></Button></div>;
}

function SharedReport() {
  const row = Route.useLoaderData();
  const { token } = Route.useParams();
  return <div className="min-h-screen bg-background">
    <header className="border-b border-border print:hidden"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"><Brand /><Button asChild size="sm"><Link to="/">Check text free</Link></Button></div></header>
    <main className="mx-auto max-w-6xl px-5 py-10">
      <p className="mb-6 text-xs text-muted-foreground print:hidden">Shared read-only report</p>
      <ReportView report={row.content as ResearchReport} date={new Date(row.created_at).toLocaleDateString()} readOnly />
      <ReportSharingBadge token={token} />
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border border-border bg-secondary p-5">
        <p className="text-sm"><span className="font-semibold">Made with Verfiai</span> — web-sourced research reports, claim fact-checks and citation checks.</p>
        <Button asChild className="print:hidden"><Link to="/">Try it free</Link></Button>
      </div>
    </main>
  </div>;
}
