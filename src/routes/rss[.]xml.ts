import { createFileRoute } from "@tanstack/react-router";
import { CLAIMS, claimReviewSchema } from "@/data/claims";

const BASE = "https://verfiai.app";
const xmlEscape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const reviewedClaims = CLAIMS.flatMap((claim) => {
          const review = claim.review;
          return review && claimReviewSchema(claim) ? [{ claim, review }] : [];
        }).sort((a, b) => b.review.reviewedAt.localeCompare(a.review.reviewedAt));
        const items = reviewedClaims
          .map(({ claim, review }) => {
            const url = `${BASE}/fact-check/${claim.slug}`;
            const pubDate = new Date(`${review.reviewedAt}T00:00:00Z`).toUTCString();
            return `    <item>
      <title>${xmlEscape(claim.claim)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
          })
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Verfiai fact checks</title>
    <link>${BASE}/fact-checks</link>
    <description>Recent dated, evidence-reviewed fact checks from Verfiai.</description>
${items}
  </channel>
</rss>
`;
        return new Response(xml, {
          headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
        });
      },
    },
  },
});
