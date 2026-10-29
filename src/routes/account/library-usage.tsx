import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ContentPage } from "@/components/verifai/ContentPage";
import { useAuth } from "@/hooks/useAuth";
import { getLibraryUsage } from "@/lib/library.functions";
import { useSiteLocale } from "@/lib/locale";
export const Route = createFileRoute("/account/library-usage")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex,nofollow" },
      { title: "Evidence Library usage | Verfiai" },
      {
        name: "description",
        content: "View your Analyst Evidence Library allowance and download history.",
      },
      { property: "og:title", content: "Evidence Library usage | Verfiai" },
      {
        property: "og:description",
        content: "Review your Evidence Library download allowance and renewal date.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LibraryUsage,
});
function LibraryUsage() {
  const { lang } = useSiteLocale();
  const { user, loading } = useAuth();
  const fetchUsage = useServerFn(getLibraryUsage);
  const [usage, setUsage] = useState<Awaited<ReturnType<typeof getLibraryUsage>> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (user)
      fetchUsage()
        .then(setUsage)
        .catch(() => setError("Usage could not load right now."));
  }, [user, fetchUsage]);
  return (
    <ContentPage
      lang={lang}
      title="Evidence Library downloads"
      intro="Library downloads are paused; previews remain available."
    >
      {loading ? (
        <p>Checking your account…</p>
      ) : !user ? (
        <p>
          <Link to="/auth" className="text-brand underline">
            Sign in
          </Link>{" "}
          to see your allowance.
        </p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : !usage ? (
        <p role="status">Loading allowance…</p>
      ) : usage.active ? (
        <>
          <p className="font-display text-2xl font-bold">
            Library downloads are not available yet.
          </p>
          <p className="mt-2 text-muted-foreground">
            Your recorded Analyst allowance: {usage.remaining} of 50. This is not currently usable
            for downloads.
          </p>
          <p className="mt-3 text-muted-foreground">
            Your allowance resets on:{" "}
            {usage.resetsAt ? new Date(usage.resetsAt).toLocaleDateString() : "Not available"}
          </p>
          <h2 className="mt-10 text-xl font-bold">This cycle’s downloads</h2>
          {usage.history.length ? (
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {usage.history.map((item, i) => (
                <li key={`${item.resource_id}-${i}`} className="py-3 text-sm">
                  Resource {item.resource_id} · {new Date(item.downloaded_at).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted-foreground">No downloads this billing cycle.</p>
          )}
        </>
      ) : (
        <>
          <p>
            Library downloads and Analyst subscriptions are not available yet. You can browse
            reviewed previews; the existing Pro plan remains unchanged.
          </p>
          <Link to="/resources" className="mt-4 inline-block text-brand underline">
            Browse library previews
          </Link>
        </>
      )}
    </ContentPage>
  );
}
