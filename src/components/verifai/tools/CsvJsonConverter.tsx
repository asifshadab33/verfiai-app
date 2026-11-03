/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { CopyButton } from "./CopyButton";

export default function CsvJsonConverter() {
  const [csv, setCsv] = useState("");
  const [json, setJson] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) {
      setJson("");
      setError("Add a header row and at least one data row to convert.");
      return;
    }
    setError("");
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

  return (
    <div className="space-y-4">
      <label className="field-label">
        CSV data (first row must contain headers)
        <textarea
          className="mt-2 w-full rounded-lg border p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          rows={6}
          placeholder="Paste CSV data here (first row must be headers)..."
          value={csv}
          onChange={(e) => {
            setCsv(e.target.value);
            setError("");
          }}
        />
      </label>
      <button
        onClick={convert}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Convert to JSON
      </button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {json && (
        <div className="relative">
          <pre className="w-full p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono max-h-64">
            {json}
          </pre>
          <CopyButton text={json} label="Copy JSON" className="absolute right-2 top-2" />
        </div>
      )}
    </div>
  );
}
