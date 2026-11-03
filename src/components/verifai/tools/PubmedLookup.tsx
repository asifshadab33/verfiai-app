import React, { useState } from 'react';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { lookupPubmed } from '@/lib/tools/pubmed';

export default function PubmedLookup() {
  const [pmid, setPmid] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!pmid.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await lookupPubmed(pmid);
      const doc = data.result[pmid];
      if (!doc) throw new Error('PMID not found.');
      setResult(doc);
    } catch (err: any) {
      setError('Failed to fetch. NCBI API may be blocking this request (CORS) or PMID is invalid.');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="text" placeholder="Enter PMID (e.g., 12345678)" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={pmid} onChange={(e) => setPmid(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLookup()} />
        <button onClick={handleLookup} disabled={loading || !pmid.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lookup'}
        </button>
      </div>
      {error && <div className="bg-gray-50 text-gray-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-gray-200"><AlertCircle className="w-4 h-4" /> {error}</div>}
      {result && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-2">{result.title}</h4>
          <p className="text-sm text-blue-800 mb-2"><strong>Authors:</strong> {result.authors?.map((a: any) => a.name).join(', ')}</p>
          <p className="text-sm text-blue-800 mb-3"><strong>Journal:</strong> {result.source} ({result.pubdate})</p>
          <a href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            View on PubMed <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
