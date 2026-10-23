import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowUpRight, Flag } from "lucide-react";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { Button } from "@/components/ui/button";
import { getResource, submitResourceIssue } from "@/lib/library.functions";
import { useAuth } from "@/hooks/useAuth";
import { libraryIssueInput, safePublisherUrl } from "@/lib/library-policy";
import { useSiteLocale } from "@/lib/locale";

export const Route = createFileRoute("/resources/$slug")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title: "Resource details | Verfiai" },
      {
        name: "description",
        content:
          "Inspect publisher, evidence sources, reuse conditions and report availability for a Verfiai resource.",
      },
      { property: "og:title", content: "Resource details | Verfiai" },
      {
        property: "og:description",
        content: "Review sources and reuse conditions before accessing research.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResourceDetail,
});
function ResourceDetail() {
  const { lang } = useSiteLocale();
  const { slug } = Route.useParams();
  const fetchResource = useServerFn(getResource);
  const report = useServerFn(submitResourceIssue);
  const { user } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof getResource>>>(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueType, setIssueType] = useState<
    "SOURCE_BROKEN" | "COPYRIGHT_CONCERN" | "EVIDENCE_OUTDATED" | "INACCURATE_CONTENT" | "OTHER"
  >("SOURCE_BROKEN");
  const [issueText, setIssueText] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    let active = true;
    setBusy(true);
    fetchResource({ data: { slug } })
      .then((result) => {
        if (active) {
          setData(result);
          setBusy(false);
        }
      })
      .catch(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [slug, fetchResource]);
  async function sendIssue() {
    if (!data || sending) return;
    const input = libraryIssueInput.safeParse({ id: data.item.id, type: issueType, message: issueText });
    if (!input.success) { setMessage("Enter issue details between 10 and 2,000 characters."); return; }
    setSending(true);
    try {
      await report({ data: input.data });
      setMessage("Thanks. Your report has been received.");
      setIssueOpen(false);
      setIssueText("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not send this report.");
    } finally { setSending(false); }
  }
  if (busy)
    return (
      <ContentPage lang={lang} title="Resource details" intro="Loading resource…">
        <p role="status">Loading…</p>
      </ContentPage>
    );
  if (!data)
    return (
      <ContentPage
        lang={lang}
        title="Resource unavailable"
        intro="This item may have been removed or is still under review."
      >
        <Link to="/resources" className="text-brand underline">
          Browse the library
        </Link>
      </ContentPage>
    );
  const { item, sources } = data;
  return (
    <ContentPage lang={lang} title={item.title} intro={item.summary}>
      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>{item.category}</span>
            <span>{item.region}</span>
            <span>{item.language}</span>
            <span>Free preview</span>
          </div>
          <PageSection title="Overview">
            <p className="whitespace-pre-wrap">{item.preview_content || item.summary}</p>
          </PageSection>
          {item.evidence_strength && (
            <PageSection title="Evidence strength">
              <p>
                {item.evidence_strength} — review linked sources independently before relying on
                this assessment.
              </p>
            </PageSection>
          )}
          <PageSection title="Sources and rights">
            <p>
              This Verfiai report is an original evidence synthesis. Linked external sources remain
              the property of their respective publishers. Reuse of external material is subject to
              the licence and terms shown for each source.
            </p>
            <ul className="mt-5 space-y-4">
              {sources.map((source) => (
                <li key={source.url} className="border-s-2 border-border ps-4">
                  <a
                    href={safePublisherUrl(source.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                  >
                    {source.title} <ArrowUpRight className="size-4" />
                  </a>
                  <p className="text-sm">
                    {source.publisher} · {source.licence_name}
                  </p>
                  <p className="text-xs">{source.reuse_conditions}</p>
                </li>
              ))}
            </ul>
          </PageSection>
          <PageSection title="Limitations">
            <p>
              Evidence can change. A source link does not prove a claim; review its original
              context, date, and methodology before relying on it.
            </p>
          </PageSection>
        </div>
        <aside className="space-y-5 border-t border-border pt-6 text-sm lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0">
          <p>
            <strong>Publisher</strong>
            <br />
            {item.publisher}
          </p>
          <p>
            <strong>Reuse conditions</strong>
            <br />
            {item.licence_name} · {item.reuse_conditions}
          </p>
          {item.licence_url && (
            <a
              href={safePublisherUrl(item.licence_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-brand underline"
            >
              View licence
            </a>
          )}
          <p>
            <strong>Latest verification</strong>
            <br />
            {item.verified_at ? new Date(item.verified_at).toLocaleDateString() : "Not recorded"}
          </p>
          <p>
            <strong>Sources</strong>
            <br />
            {item.source_count}
          </p>
          <a
            href={safePublisherUrl(item.original_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-brand underline"
          >
            Open publisher <ArrowUpRight className="size-4" />
          </a>
          {item.kind === "library" && (
            <p className="text-muted-foreground">
              Library downloads are not available yet. You can inspect this preview and the
              publisher’s sources.
            </p>
          )}
          <Button variant="outline" className="w-full" onClick={() => setIssueOpen(!issueOpen)}>
            <Flag />
            Report an issue
          </Button>
          {issueOpen &&
            (user ? (
              <div className="space-y-3">
                <label className="block">
                  Issue type
                  <select
                    aria-label="Issue type"
                    className="mt-1 w-full border border-input bg-card p-2"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as typeof issueType)}
                  >
                    {[
                      "SOURCE_BROKEN",
                      "COPYRIGHT_CONCERN",
                      "EVIDENCE_OUTDATED",
                      "INACCURATE_CONTENT",
                      "OTHER",
                    ].map((v) => (
                      <option key={v} value={v}>
                        {v.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  Details
                  <textarea
                    className="mt-1 w-full border border-input bg-card p-2"
                    minLength={10}
                    maxLength={2000}
                    value={issueText}
                    onChange={(e) => setIssueText(e.target.value)}
                  />
                </label>
                <Button disabled={sending || issueText.trim().length < 10} onClick={sendIssue}>
                  Send report
                </Button>
              </div>
            ) : (
              <p>
                <Link to="/auth" className="text-brand underline">
                  Sign in
                </Link>{" "}
                to report an issue.
              </p>
            ))}
          {message && (
            <p role="status" className="text-muted-foreground">
              {message}
            </p>
          )}
        </aside>
      </div>
    </ContentPage>
  );
}
