import React, { useState } from "react";
import { securePick, secureShuffle } from "@/lib/tools/random-picker";
export default function RandomPicker() {
  const [text, setText] = useState("");
  const [count, setCount] = useState(1);
  const [result, setResult] = useState<string[]>([]);
  const [mode, setMode] = useState<"pick" | "shuffle">("pick");
  const run = () => {
    const items = text.split("\n").filter((i) => i.trim());
    if (mode === "pick") setResult(securePick(items, Math.min(count, items.length)));
    else setResult(secureShuffle(items));
  };
  return (
    <div className="space-y-4">
      <label className="field-label">
        Items (one per line)
        <textarea
          className="mt-2 w-full rounded-lg border p-3"
          rows={5}
          placeholder="Enter items (one per line)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("pick")}
            aria-pressed={mode === "pick"}
            className={`min-h-11 rounded-lg px-4 py-2 font-medium ${mode === "pick" ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Pick Random
          </button>
          <button
            onClick={() => setMode("shuffle")}
            aria-pressed={mode === "shuffle"}
            className={`min-h-11 rounded-lg px-4 py-2 font-medium ${mode === "shuffle" ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Shuffle List
          </button>
        </div>
        {mode === "pick" && (
          <label htmlFor="random-pick-count" className="field-label">
            Number to pick
            <input
              id="random-pick-count"
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="mt-2 w-24 rounded-lg border p-2"
            />
          </label>
        )}
        <button
          onClick={run}
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Run
        </button>
      </div>
      {result.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="mb-2 font-bold text-gray-900">Result</h2>
          <ul className="space-y-1">
            {result.map((item, i) => (
              <li key={i} className="bg-white p-2 rounded border border-gray-200 text-sm">
                {mode === "pick" ? `#${i + 1}: ` : ""}
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
