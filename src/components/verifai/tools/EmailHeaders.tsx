import React, { useState } from 'react';
import { parseEmailHeaders } from '@/lib/tools/email-headers';
export default function EmailHeaders() {
  const [raw, setRaw] = useState('');
  const [result, setResult] = useState<ReturnType<typeof parseEmailHeaders> | null>(null);
  const analyze = () => setResult(parseEmailHeaders(raw));
  const getStatusColor = (s: string) => s.toLowerCase() === 'pass' ? 'text-green-700 bg-green-50' : s.toLowerCase() === 'fail' ? 'text-red-700 bg-red-50' : 'text-gray-700 bg-gray-50';
  return (
    <div className="space-y-4">
      <textarea className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs" rows={8} placeholder="Paste raw email headers here..." value={raw} onChange={(e) => setRaw(e.target.value)} />
      <button onClick={analyze} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Analyze Headers</button>
      {result && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className={`p-3 rounded text-center font-bold ${getStatusColor(result.spf)}`}>SPF: {result.spf}</div>
            <div className={`p-3 rounded text-center font-bold ${getStatusColor(result.dkim)}`}>DKIM: {result.dkim}</div>
            <div className={`p-3 rounded text-center font-bold ${getStatusColor(result.dmarc)}`}>DMARC: {result.dmarc}</div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Received Chain (Newest to Oldest):</h4>
            <ul className="space-y-1 text-xs font-mono text-gray-700 bg-white p-3 rounded border border-gray-200 max-h-48 overflow-y-auto">
              {result.received.length > 0 ? result.received.map((r, i) => <li key={i} className="border-b border-gray-100 pb-1 last:border-0">{r.replace('Received: ', '')}</li>) : <li>No Received headers found.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
