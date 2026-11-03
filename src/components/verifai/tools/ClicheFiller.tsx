import React, { useState } from "react";
import { detectFillers } from "@/lib/tools/cliche-filler";
export default function ClicheFiller() {
  const [text, setText] = useState("");
  const [matches, setMatches] = useState<ReturnType<typeof detectFillers>>([]);
  const analyze = () => setMatches(detectFillers(text));
  const render = () => {
    if (!text) return null;
    const els: React.ReactNode[] = [];
    let last = 0;
    for (const m of matches) {
      if (m.index > last) els.push(text.slice(last, m.index));
      els.push(
        <mark key={m.index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {text.slice(m.index, m.index + m.word.length)}
        </mark>,
      );
      last = m.index + m.word.length;
    }
    if (last < text.length) els.push(text.slice(last));
    return els;
  };
  return (
    <div className="space-y-4">
      <label className="field-label">
        Text to check
        <textarea
          className="mt-2 w-full rounded-lg border p-3"
          rows={5}
          placeholder="Paste text to find filler words..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button
        onClick={analyze}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
      >
        Detect Fillers
      </button>
      {matches.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h2 className="font-bold text-yellow-900">Found {matches.length} fillers</h2>
          <div className="mt-2 bg-white p-3 rounded border text-sm">{render()}</div>
        </div>
      )}
    </div>
  );
}
