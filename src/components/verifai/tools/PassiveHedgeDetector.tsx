import React, { useState } from "react";
import { detectPassiveAndHedge } from "@/lib/tools/passive-hedge";
export default function PassiveHedgeDetector() {
  const [text, setText] = useState("");
  const [matches, setMatches] = useState<{ type: string; word: string; index: number }[]>([]);
  const analyze = () => setMatches(detectPassiveAndHedge(text));
  const renderHighlightedText = () => {
    if (!text) return null;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    for (const match of matches) {
      if (match.index > lastIndex) elements.push(text.slice(lastIndex, match.index));
      elements.push(
        <mark
          key={match.index}
          className={
            match.type === "passive"
              ? "bg-red-200 text-red-900 px-1 rounded"
              : "bg-yellow-200 text-yellow-900 px-1 rounded"
          }
        >
          {text.slice(match.index, match.index + match.word.length)}
        </mark>,
      );
      lastIndex = match.index + match.word.length;
    }
    if (lastIndex < text.length) elements.push(text.slice(lastIndex));
    return elements;
  };
  return (
    <div className="space-y-4">
      <textarea
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        rows={6}
        placeholder="Paste your text to detect passive voice (red) and hedge words (yellow)..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={analyze}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Analyze Text
      </button>
      {matches.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-2">Found {matches.length} instances:</h4>
          <div className="bg-white p-4 rounded border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {renderHighlightedText()}
          </div>
        </div>
      )}
    </div>
  );
}
