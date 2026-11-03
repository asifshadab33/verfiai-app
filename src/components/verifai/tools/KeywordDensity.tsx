import React, { useState } from "react";
import { getKeywordDensity } from "@/lib/tools/keyword-density";
export default function KeywordDensity() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<{ word: string; count: number; percentage: number }[]>([]);
  const analyze = () => setResults(getKeywordDensity(text));
  return (
    <div className="space-y-4">
      <label className="field-label">
        Article text
        <textarea
          className="mt-2 w-full rounded-lg border p-4 focus:ring-2 focus:ring-blue-500 outline-none"
          rows={6}
          placeholder="Paste your article text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button
        onClick={analyze}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Analyze Density
      </button>
      {results.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="mb-3 font-bold text-gray-900">Top keywords (more than 3 characters)</h2>
          <div className="space-y-2">
            {results.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-white p-3 rounded border border-gray-200"
              >
                <span className="font-medium text-gray-800 capitalize">{item.word}</span>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{item.count} times</span>
                  <span className="font-bold text-blue-600">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
