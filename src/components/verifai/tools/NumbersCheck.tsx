import React, { useState } from "react";
import { checkNumbers } from "@/lib/tools/numbers-check";
export default function NumbersCheck() {
  const [text, setText] = useState("");
  const [warnings, setWarnings] = useState<ReturnType<typeof checkNumbers>>([]);
  const analyze = () => setWarnings(checkNumbers(text));
  return (
    <div className="space-y-4">
      <label className="field-label">
        News text or statistics
        <textarea
          className="mt-2 w-full rounded-lg border p-4 focus:ring-2 focus:ring-blue-500 outline-none"
          rows={6}
          placeholder="Paste news text or statistics..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button
        onClick={analyze}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Check Numbers
      </button>
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h2 className="mb-2 font-bold text-yellow-900">Statistical warnings</h2>
          <ul className="space-y-2">
            {warnings.map((w, i) => (
              <li key={i} className="bg-white p-3 rounded border border-yellow-100 text-sm">
                <strong className="text-yellow-900">{w.type}:</strong>{" "}
                <span className="text-gray-700 italic">"{w.snippet}"</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
