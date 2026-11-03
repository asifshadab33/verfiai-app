import React, { useState } from 'react';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { checkWayback } from '@/lib/tools/wayback';

export default function WaybackChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await checkWayback(url);
      if (data.archived_snapshots?.closest) setResult(data.archived_snapshots.closest);
      else setError('No archived snapshots found for this URL.');
    } catch (err) { setError('Failed to check. Archive.org API may be blocking this request (CORS). Per project rules, skipped.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="text" placeholder="https://example.com/article" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} />
        <button onClick={handleCheck} disabled={loading || !url.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Archive'}
        </button>
      </div>
      {error && <div className="bg-gray-50 text-gray-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-gray-200"><AlertCircle className="w-4 h-4" /> {error}</div>}
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h4 className="font-bold text-green-800 mb-2">✅ Snapshot Found</h4>
          <p className="text-sm text-green-700 mb-3">Archived on: <strong>{new Date(result.timestamp).toLocaleDateString()}</strong></p>
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">View Archived Page <ExternalLink className="w-4 h-4" /></a>
        </div>
      )}
    </div>
  );
}
