/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { calculateReadability } from "@/lib/tools/readability";
export default function ReadabilityScorer() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState<any>(null);
  const analyze = () => setStats(calculateReadability(text));
  return (
    <div className="space-y-4">
      <textarea
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        rows={6}
        placeholder="Paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={analyze}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Calculate Score
      </button>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.gradeLevel}</div>
            <div className="text-xs text-blue-600 uppercase font-semibold">Grade Level</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{stats.difficulty}</div>
            <div className="text-xs text-green-600 uppercase font-semibold">Difficulty</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">{stats.words}</div>
            <div className="text-xs text-purple-600 uppercase font-semibold">Words</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-700">{stats.sentences}</div>
            <div className="text-xs text-orange-600 uppercase font-semibold">Sentences</div>
          </div>
        </div>
      )}
    </div>
  );
}
