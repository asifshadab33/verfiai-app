import React, { useState } from 'react';
import { detectInvisibleChars } from '@/lib/tools/invisible-chars';

export default function InvisibleCharDetector() {
  const [text, setText] = useState('');
  const [found, setFound] = useState<{ char: string; code: string }[]>([]);

  const analyze = () => setFound(detectInvisibleChars(text));

  return (
    <div className="space-y-4">
      <textarea className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" rows={6} placeholder="Paste suspicious text here to check for zero-width or hidden Unicode characters..." value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={analyze} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Scan for Hidden Characters</button>
      {found.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h4 className="font-bold text-red-800 mb-2">⚠️ Hidden Characters Detected:</h4>
          <div className="flex flex-wrap gap-2">
            {found.map((item, i) => (
              <span key={i} className="bg-red-200 text-red-900 px-3 py-1 rounded font-mono text-sm">
                Code: {item.code}
              </span>
            ))}
          </div>
          <p className="text-xs text-red-700 mt-3">These characters are invisible but can be used for spoofing or formatting tricks. Consider removing them.</p>
        </div>
      )}
      {text && found.length === 0 && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-green-800 font-medium">✅ No hidden Unicode characters detected.</div>
      )}
    </div>
  );
}
