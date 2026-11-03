import React, { useState, useEffect } from "react";
export default function CharacterCounter() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState({ words: 0, chars: 0, charsNoSpace: 0, lines: 0 });
  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const lines = text.split("\n").length;
    setStats({ words, chars, charsNoSpace, lines });
  }, [text]);
  return (
    <div className="space-y-4">
      <textarea
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        rows={8}
        placeholder="Paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {text && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.chars}</div>
            <div className="text-xs text-blue-600 uppercase font-semibold">Characters</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{stats.charsNoSpace}</div>
            <div className="text-xs text-green-600 uppercase font-semibold">No Spaces</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">{stats.words}</div>
            <div className="text-xs text-purple-600 uppercase font-semibold">Words</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-700">{stats.lines}</div>
            <div className="text-xs text-orange-600 uppercase font-semibold">Lines</div>
          </div>
        </div>
      )}
    </div>
  );
}
