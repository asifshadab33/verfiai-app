/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toTitleCase } from "@/lib/tools/title-case";

export default function TitleCaseConverter() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<"apa" | "chicago" | "mla">("apa");
  const [copied, setCopied] = useState(false);

  const result = toTitleCase(text, style);
  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <select
        className="w-full p-2 border border-gray-300 rounded-lg"
        value={style}
        onChange={(e) => setStyle(e.target.value as any)}
      >
        <option value="apa">APA Style</option>
        <option value="chicago">Chicago Style</option>
        <option value="mla">MLA Style</option>
      </select>
      <textarea
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        rows={3}
        placeholder="Paste your lowercase or messy title here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {text && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between gap-4">
          <p className="text-lg font-medium text-gray-900">{result}</p>
          <button onClick={copy} className="text-gray-500 hover:text-blue-600 flex-shrink-0">
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  );
}
