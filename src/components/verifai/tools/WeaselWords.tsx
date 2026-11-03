import React, { useState } from "react";
import { detectWeaselWords } from "@/lib/tools/weasel-words";

export default function WeaselWords() {
  const [text, setText] = useState("");
  const [matches, setMatches] = useState<{ word: string; startIndex: number; endIndex: number }[]>(
    [],
  );

  const analyze = () => setMatches(detectWeaselWords(text));

  // XSS SAFE: Render text by splitting it around matches and wrapping matches in <mark>
  const renderHighlightedText = () => {
    if (!text) return null;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    for (const match of matches) {
      if (match.startIndex > lastIndex) elements.push(text.slice(lastIndex, match.startIndex));
      elements.push(
        <mark key={match.startIndex} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {text.slice(match.startIndex, match.endIndex)}
        </mark>,
      );
      lastIndex = match.endIndex;
    }
    if (lastIndex < text.length) elements.push(text.slice(lastIndex));
    return elements;
  };

  return (
    <div className="space-y-4">
      <label className="field-label">
        Text to review
        <textarea
          className="mt-2 w-full rounded-lg border p-4 focus:ring-2 focus:ring-blue-500 outline-none"
          rows={6}
          placeholder="Paste your text here to detect vague, unsupported claims..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button
        onClick={analyze}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Detect Weasel Words
      </button>
      {matches.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h2 className="mb-2 font-bold text-yellow-900">
            {matches.length} vague phrases detected:
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {[...new Set(matches.map((m) => m.word))].map((word) => (
              <span
                key={word}
                className="bg-yellow-200 text-yellow-900 px-2 py-1 rounded text-sm font-medium capitalize"
              >
                {word}
              </span>
            ))}
          </div>
          <div className="bg-white p-4 rounded border border-yellow-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {renderHighlightedText()}
          </div>
        </div>
      )}
    </div>
  );
}
