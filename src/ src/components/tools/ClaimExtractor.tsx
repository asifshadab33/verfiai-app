import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

export default function ClaimExtractor() {
  const [text, setText] = useState('');
  const [claims, setClaims] = useState<string[]>([]);

  const extractClaims = () => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const extracted = sentences.filter(s => {
      const hasNumber = /\d+/.test(s);
      const hasDate = /\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{4})\b/i.test(s);
      const isShort = s.trim().split(' ').length < 8;
      return (hasNumber || hasDate) && !isShort;
    }).map(s => s.trim());
    setClaims(extracted);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Paste Article Text</label>
        <textarea 
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the text you want to analyze..."
        />
        <button onClick={extractClaims} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Extract Claims
        </button>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4">Extracted Checkable Claims</h4>
        {claims.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No strong factual claims detected yet.</p>
        ) : (
          <ul className="space-y-3">
            {claims.map((claim, idx) => (
              <li key={idx} className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-800 flex justify-between items-start gap-2">
                <span>{claim}</span>
                <a href={`https://verfiai.app/app?claim=${encodeURIComponent(claim)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex-shrink-0 flex items-center gap-1 text-xs font-semibold">
                  Verify <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
