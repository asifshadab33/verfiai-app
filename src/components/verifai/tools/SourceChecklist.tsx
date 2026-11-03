import React, { useState } from "react";
const criteria = [
  "Author is clearly identified and has relevant expertise.",
  "Publication date is recent and relevant to the topic.",
  "Claims are backed by citations or links to primary sources.",
  "The source is independent (not funded by the subject of the article).",
  "The tone is objective and avoids emotional or sensational language.",
  "The information can be verified by at least one other reputable source.",
];
export default function SourceChecklist() {
  const [checked, setChecked] = useState<boolean[]>(new Array(criteria.length).fill(false));
  const toggle = (i: number) => {
    const n = [...checked];
    n[i] = !n[i];
    setChecked(n);
  };
  const score = checked.filter(Boolean).length;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {criteria.map((c, i) => (
          <label
            key={i}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
          >
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              className="mt-1 h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-800">{c}</span>
          </label>
        ))}
      </div>
      <div
        className={`p-4 rounded-lg border ${score >= 5 ? "bg-green-50 border-green-200" : score >= 3 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"}`}
      >
        <h2 className="font-bold">Source reliability score: {score}/6</h2>
        <p className="text-sm mt-1">
          {score >= 5
            ? "Highly reliable source."
            : score >= 3
              ? "Use with caution; verify claims independently."
              : "Low reliability; do not use as a primary source."}
        </p>
      </div>
    </div>
  );
}
