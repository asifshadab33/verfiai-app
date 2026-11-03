/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CsvJsonConverter() {
  const [csv, setCsv] = useState("");
  const [json, setJson] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = () => {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) {
      setJson("");
      return;
    }
    const headers = (lines[0] ?? "").split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const result = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return obj;
    });
    setJson(JSON.stringify(result, null, 2));
  };

  const copy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <textarea
        aria-label="CSV data to convert"
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
        rows={6}
        placeholder="Paste CSV data here (first row must be headers)..."
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
      />
      <button
        onClick={convert}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Convert to JSON
      </button>
      {json && (
        <div className="relative">
          <pre className="w-full p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono max-h-64">
            {json}
          </pre>
          <button
            aria-label={copied ? "JSON copied" : "Copy JSON"}
            onClick={copy}
            className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
