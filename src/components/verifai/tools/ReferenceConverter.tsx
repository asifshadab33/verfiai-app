/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { bibtexToText, formatReference } from "@/lib/tools/reference-converter";
export default function ReferenceConverter() {
  const [bibtex, setBibtex] = useState("");
  const [style, setStyle] = useState<"apa" | "mla" | "chicago">("apa");
  const [result, setResult] = useState("");
  const convert = () => {
    const data = bibtexToText(bibtex);
    if (data) setResult(formatReference(data, style));
    else setResult("Could not parse BibTeX. Ensure it contains title={...}");
  };
  return (
    <div className="space-y-4">
      <label className="field-label">
        BibTeX entry
        <textarea
          className="mt-2 w-full rounded-lg border p-3 font-mono text-sm"
          rows={5}
          placeholder="Paste BibTeX entry here..."
          value={bibtex}
          onChange={(e) => setBibtex(e.target.value)}
        />
      </label>
      <div className="flex gap-2">
        <label className="field-label flex-1">
          Citation style
          <select
            className="mt-2 w-full rounded-lg border p-3"
            value={style}
            onChange={(e) => setStyle(e.target.value as any)}
          >
            <option value="apa">APA</option>
            <option value="mla">MLA</option>
            <option value="chicago">Chicago</option>
          </select>
        </label>
        <button
          onClick={convert}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Convert
        </button>
      </div>
      {result && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-800">
          {result}
        </div>
      )}
    </div>
  );
}
