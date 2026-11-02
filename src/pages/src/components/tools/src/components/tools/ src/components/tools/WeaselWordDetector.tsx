import React, { useState } from 'react';

export default function WeaselWordDetector() {
  const [text, setText] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);

  const weaselWords = [
    "studies show", "experts agree", "many people say", "research indicates", 
    "it is believed", "some say", "widely reported", "critics argue", "often", "usually"
  ];

  const analyzeText = () => {
    const lowerText = text.toLowerCase();
    const found = weaselWords.filter(word => lowerText.includes(word));
    setHighlights([...new Set(found)]);
  };

  const getHighlightedText = () => {
    let result = text;
    highlights.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      result = result.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
    });
    return result;
  };

  return (
    <div className="space-y-4">
      <textarea 
        placeholder="Paste your article or draft here to detect vague, unsupported claims..." 
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={analyzeText} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
        Detect Weasel Words
      </button>
      
      {highlights.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h4 className="font-bold text-yellow-800 mb-2">⚠️ {highlights.length} Vague Phrases Detected:</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {highlights.map(word => (
              <span key={word} className="bg-yellow-200 text-yellow-900 px-2 py-1 rounded text-sm font-medium capitalize">{word}</span>
            ))}
          </div>
          <div className="prose prose-sm max-w-none bg-white p-4 rounded border border-yellow-100" dangerouslySetInnerHTML={{ __html: getHighlightedText().replace(/\n/g, '<br/>') }} />
        </div>
      )}
    </div>
  );
}
