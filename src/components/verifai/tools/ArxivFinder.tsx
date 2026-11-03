import React, { useState } from 'react';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
export default function ArxivFinder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const search = async () => {
    setLoading(true); setError(''); setResults([]);
    try {
      const res = await fetch(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=5`);
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/xml');
      const entries = Array.from(doc.getElementsByTagName('entry')).map(e => ({
        title: e.getElementsByTagName('title')[0]?.textContent?.trim(),
        link: e.getElementsByTagName('id')[0]?.textContent,
        summary: e.getElementsByTagName('summary')[0]?.textContent?.substring(0, 150) + '...'
      }));
      setResults(entries);
    } catch { setError('Failed to fetch. arXiv API blocks browser requests (CORS). Per project rules, skipped.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className="flex-1 p-3 border border-gray-300 rounded-lg" placeholder="Search physics, CS, math papers..." value={query} onChange={e => setQuery(e.target.value)} />
        <button onClick={search} disabled={loading || !query} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}</button>
      </div>
      {error && <div className="bg-gray-50 text-gray-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-gray-200"><AlertCircle className="w-4 h-4" /> {error}</div>}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <a href={r.link} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline flex items-center gap-2">{r.title} <ExternalLink className="w-4 h-4" /></a>
              <p className="text-sm text-gray-600 mt-2">{r.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
