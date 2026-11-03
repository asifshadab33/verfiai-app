/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { calculateSimilarity } from "@/lib/tools/similarity";
export default function SimilarityChecker() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [result, setResult] = useState<any>(null);
  const analyze = () => setResult(calculateSimilarity(text1, text2));
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          rows={6}
          placeholder="Paste first text here..."
          value={text1}
          onChange={(e) => setText1(e.target.value)}
        />
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          rows={6}
          placeholder="Paste second text here..."
          value={text2}
          onChange={(e) => setText2(e.target.value)}
        />
      </div>
      <button
        onClick={analyze}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Compare Similarity
      </button>
      {result && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
          <div className="text-4xl font-bold text-blue-700 mb-2">{result.overlapPercent}%</div>
          <p className="text-sm text-blue-800 font-medium">Word Overlap (Jaccard Similarity)</p>
          <p className="text-xs text-blue-600 mt-2">
            Note: This is a basic word overlap checker, NOT a plagiarism detector.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
            <div className="bg-white p-2 rounded">
              <strong>{result.uniqueWords1}</strong>
              <br />
              Unique Words (Text 1)
            </div>
            <div className="bg-white p-2 rounded">
              <strong>{result.sharedWords}</strong>
              <br />
              Shared Words
            </div>
            <div className="bg-white p-2 rounded">
              <strong>{result.uniqueWords2}</strong>
              <br />
              Unique Words (Text 2)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
