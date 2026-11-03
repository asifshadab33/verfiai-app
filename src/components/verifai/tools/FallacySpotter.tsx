import React, { useState } from 'react';
import { detectFallacies } from '@/lib/tools/fallacy-spotter';
export default function FallacySpotter() {
  const [text, setText] = useState('');
  const [matches, setMatches] = useState<ReturnType<typeof detectFallacies>>([]);
  const analyze = () => setMatches(detectFallacies(text));
  return (
    <div className="space-y-4">
      <textarea className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={6} placeholder="Paste text to check for logical fallacies..." value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={analyze} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Analyze Argument</button>
      {matches.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h4 className="font-bold text-yellow-800 mb-2">⚠️ Potential Fallacies Detected (Review Context):</h4>
          <ul className="space-y-2">
            {matches.map((m, i) => (<li key={i} className="bg-white p-3 rounded border border-yellow-100 text-sm"><strong className="text-yellow-900">{m.name}:</strong> <span className="text-gray-700 italic">"...{m.snippet}..."</span></li>))}
          </ul>
        </div>
      )}
    </div>
  );
}
