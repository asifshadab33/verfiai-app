import React, { useState } from "react";
import { detectInvisibleChars } from "@/lib/tools/invisible-chars";
export default function InvisibleChars() {
  const [text, setText] = useState("");
  const [found, setFound] = useState<ReturnType<typeof detectInvisibleChars>>([]);
  const analyze = () => setFound(detectInvisibleChars(text));
  return (
    <div className="space-y-4">
      <label className="field-label">
        Text to scan
        <textarea
          className="mt-2 w-full rounded-lg border p-4 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
          rows={6}
          placeholder="Paste suspicious text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button
        onClick={analyze}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Scan for Hidden Characters
      </button>
      {found.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h2 className="mb-2 font-bold text-red-900">Hidden characters detected</h2>
          <div className="flex flex-wrap gap-2">
            {found.map((item, i) => (
              <span key={i} className="bg-red-200 text-red-900 px-3 py-1 rounded font-mono text-sm">
                {item.name} ({item.code})
              </span>
            ))}
          </div>
        </div>
      )}
      {text && found.length === 0 && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-green-800 font-medium">
          ✅ No hidden Unicode characters detected.
        </div>
      )}
    </div>
  );
}
