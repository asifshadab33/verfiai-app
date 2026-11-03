const ORIGIN = "https://verfiai.app";

/** Head metadata shared by every free-tool page: title, description, canonical and free-app structured data. */
export function toolHead(m: { path: string; title: string; description: string; name: string }) {
  const url = `${ORIGIN}${m.path}`;
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { property: "og:title", content: m.title },
      { property: "og:description", content: m.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: m.name,
          url,
          description: m.description,
          applicationCategory: "ReferenceApplication",
          operatingSystem: "Web",
          browserRequirements: "Requires JavaScript",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  };
}
