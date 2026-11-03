import React, { useState } from "react";
import { analyzeRhythm } from "@/lib/tools/sentence-rhythm";
export default function SentenceRhythm() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState<ReturnType<typeof analyzeRhythm>>(null);
  return (
    <div className="space-y-4">
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg"
        rows={5}
        placeholder="Paste text to analyze sentence flow..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => setStats(analyzeRhythm(text))}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
      >
        Analyze Rhythm
      </button>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-xs text-blue-600 uppercase">Sentences</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{stats.avg}</div>
            <div className="text-xs text-green-600 uppercase">Avg Words</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">{stats.variance}</div>
            <div className="text-xs text-purple-600 uppercase">Variance</div>
          </div>
          <div
            className={`p-4 rounded-lg text-center ${stats.longSentences > 0 ? "bg-red-50" : "bg-gray-50"}`}
          >
            <div
              className={`text-2xl font-bold ${stats.longSentences > 0 ? "text-red-700" : "text-gray-700"}`}
            >
              {stats.longSentences}
            </div>
            <div className="text-xs text-gray-600 uppercase">Very Long (&gt;30w)</div>
          </div>
        </div>
      )}
    </div>
  );
}
