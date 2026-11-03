import React, { useState } from 'react';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
export default function OrcidLookup() {
  const [orcid, setOrcid] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lookup = async () => {
    setLoading(true); setError(''); setName('');
    try {
      const res = await fetch(`https://pub.orcid.org/v3.0/${orcid}/record`, { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      const p = data.person?.name;
      setName(`${p?.['given-names']?.value || ''} ${p?.['family-name']?.value || ''}`.trim());
    } catch { setError('Failed to fetch. ORCID API blocks browser requests (CORS). Per project rules, skipped.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className="flex-1 p-3 border border-gray-300 rounded-lg" placeholder="Enter ORCID ID (e.g., 0000-0002-1825-0097)" value={orcid} onChange={e => setOrcid(e.target.value)} />
        <button onClick={lookup} disabled={loading || !orcid} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lookup'}</button>
      </div>
      {error && <div className="bg-gray-50 text-gray-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-gray-200"><AlertCircle className="w-4 h-4" /> {error}</div>}
      {name && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h4 className="font-bold text-green-800 mb-2">✅ Researcher Found:</h4>
          <p className="text-lg text-green-900">{name}</p>
          <a href={`https://orcid.org/${orcid}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-2 mt-2">View Full Profile <ExternalLink className="w-4 h-4" /></a>
        </div>
      )}
    </div>
  );
}
