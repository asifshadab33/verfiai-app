import { createFileRoute } from "@tanstack/react-router";
import { listReviewedClaimSlugs } from "@/data/claims";

const BASE = "https://verfiai.app";
const PAGES = ["/", "/features", "/how-it-works", "/sample-report", "/pricing", "/faq", "/methodology", "/about", "/accuracy", "/privacy", "/terms", "/refunds", "/app", "/research", "/fact-checker", "/fact-checks", "/sources", "/security", "/contact"];
export const sitemapPaths = () => [...PAGES, ...listReviewedClaimSlugs().map(s => `/fact-check/${s}`)];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = sitemapPaths();
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${BASE}${u}</loc></url>`).join("\n")}\n</urlset>\n`;
        return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
