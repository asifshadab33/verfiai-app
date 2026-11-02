import React, { useState, useEffect } from 'react';

export default function HeadlineAnalyzer() {
  const [headline, setHeadline] = useState('');
  const [stats, setStats] = useState({ length: 0, words: 0, powerWords: 0, clickbaitScore: 0 });

  const powerWords = ['shocking', 'amazing', 'secret', 'proven', 'ultimate', 'essential', 'breakthrough', 'unbelievable'];
  const clickbaitPhrases = ["you won't believe", "number 1 will", "doctors hate", "this one trick"];

  useEffect(() => {
    const words = headline.trim() ? headline.trim().split(/\s+/).length : 0;
    const lower = headline.toLowerCase();
    const pCount = powerWords.filter(w => lower.includes(w)).length;
    const cCount = clickbaitPhrases.filter(p => lower.includes(p)).length;
    
    let score = 100;
    if (words < 4 || words > 12) score -= 20;
    if (headline.length < 30 || headline.length > 70) score -= 15;
    score -= (cCount * 30); 
    score = Math.max(0, Math.min(100, score + (pCount * 5))); 

    setStats({ length: headline.length, words, powerWords: pCount, clickbaitScore: Math.min(100, cCount * 50) });
  }, [headline]);

  return (
    <div className="space-y-6">
      <textarea 
        placeholder="Paste your headline here..." 
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium"
        rows={2}
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
      />
      {headline && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.length}</div>
            <div className="text-xs text-blue-600 uppercase font-semibold">Characters</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{stats.words}</div>
            <div className="text-xs text-green-600 uppercase font-semibold">Words (Ideal: 6-12)</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">{stats.powerWords}</div>
            <div className="text-xs text-purple-600 uppercase font-semibold">Power Words</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${stats.clickbaitScore > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${stats.clickbaitScore > 0 ? 'text-red-700' : 'text-gray-700'}`}>{stats.clickbaitScore > 0 ? 'High' : 'Low'}</div>
            <div className="text-xs text-gray-600 uppercase font-semibold">Clickbait Risk</div>
          </div>
        </div>
      )}
    </div>
  );
}
