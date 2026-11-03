/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { toTitleCase } from "@/lib/tools/title-case";
import { CopyButton } from "./CopyButton";

export default function TitleCaseConverter() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<"apa" | "chicago" | "mla">("apa");

  const result = toTitleCase(text, style);

  return (
    <div className="space-y-4">
      <label className="field-label">
        Citation style
        <select
          className="mt-2 w-full rounded-lg border p-2"
          value={style}
          onChange={(e) => setStyle(e.target.value as any)}
        >
          <option value="apa">APA Style</option>
          <option value="chicago">Chicago Style</option>
          <option value="mla">MLA Style</option>
        </select>
      </label>
      <label className="field-label">
        Title to convert
        <textarea
          className="mt-2 w-full rounded-lg border p-4 focus:ring-2 focus:ring-blue-500 outline-none"
          rows={3}
          placeholder="Paste your lowercase or messy title here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      {text && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between gap-4">
          <p className="text-lg font-medium text-gray-900">{result}</p>
          <CopyButton text={result} label="Copy converted title" className="shrink-0" />
        </div>
      )}
    </div>
  );
}
