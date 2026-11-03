import React, { useState } from "react";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";

type ArxivResult = {
  title?: string | null;
  link?: string | null;
  summary?: string;
};

export default function ArxivFinder() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArxivResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const search = async () => {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch(
        `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=5`,
      );
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/xml");
      const entries = Array.from(doc.getElementsByTagName("entry")).map((e) => ({
        title: e.getElementsByTagName("title")[0]?.textContent?.trim() ?? null,
        link: e.getElementsByTagName("id")[0]?.textContent ?? null,
        summary: e.getElementsByTagName("summary")[0]?.textContent?.substring(0, 150) + "...",
      }));
      setResults(entries);
    } catch {
      setError(
        "Failed to fetch. arXiv API blocks browser requests (CORS). Per project rules, skipped.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="arxiv-search" className="field-label flex-1">
          Search arXiv papers
          <input
            id="arxiv-search"
            className="mt-2 w-full rounded-lg border p-3"
            placeholder="Search physics, CS, math papers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          onClick={search}
          disabled={loading || !query}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </button>
      </div>
      {error && (
        <div className="bg-gray-50 text-gray-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-gray-200">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <a
                href={r.link ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:underline flex items-center gap-2"
              >
                {r.title} <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-sm text-gray-600 mt-2">{r.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
