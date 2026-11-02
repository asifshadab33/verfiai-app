import React, { useState, useEffect } from 'react';

export default function ReadingTimeCalculator() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({ words: 0, chars: 0, charsNoSpace: 0, readTime: 0, speakTime: 0 });

  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const readTime = Math.ceil(words / 200); 
    const speakTime = Math.ceil(words / 130); 
    setStats({ words, chars, charsNoSpace, readTime, speakTime });
  }, [text]);

  return (
    <div className="space-y-6">
      <textarea 
        placeholder="Paste your text here to calculate reading and speaking time..." 
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {text && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.words}</div>
            <div className="text-xs text-blue-600 uppercase font-semibold">Words</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{stats.chars}</div>
            <div className="text-xs text-green-600 uppercase font-semibold">Characters</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">{stats.charsNoSpace}</div>
            <div className="text-xs text-purple-600 uppercase font-semibold">No Spaces</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-700">{stats.readTime}m</div>
            <div className="text-xs text-orange-600 uppercase font-semibold">Reading Time</div>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-cyan-700">{stats.speakTime}m</div>
            <div className="text-xs text-cyan-600 uppercase font-semibold">Speaking Time</div>
          </div>
        </div>
      )}
    </div>
  );
}
