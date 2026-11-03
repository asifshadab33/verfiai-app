import React, { useState } from "react";
import { generateFoiLetter, FoiData } from "@/lib/tools/foi-letter";
import { CopyButton } from "./CopyButton";
export default function FoiLetter() {
  const [data, setData] = useState<FoiData>({
    country: "",
    agency: "",
    subject: "",
    details: "",
    requesterName: "",
  });
  const [letter, setLetter] = useState("");
  const generate = () => {
    setLetter(generateFoiLetter(data));
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="field-label">
          Country or jurisdiction
          <input
            className="mt-2 w-full rounded-lg border p-3"
            placeholder="Country/Jurisdiction"
            value={data.country}
            onChange={(e) => setData({ ...data, country: e.target.value })}
          />
        </label>
        <label className="field-label">
          Agency or department
          <input
            className="mt-2 w-full rounded-lg border p-3"
            placeholder="Agency/Department Name"
            value={data.agency}
            onChange={(e) => setData({ ...data, agency: e.target.value })}
          />
        </label>
        <label className="field-label md:col-span-2">
          Subject of request
          <input
            className="mt-2 w-full rounded-lg border p-3"
            placeholder="Subject of Request"
            value={data.subject}
            onChange={(e) => setData({ ...data, subject: e.target.value })}
          />
        </label>
        <label className="field-label md:col-span-2">
          Records requested
          <textarea
            className="mt-2 w-full rounded-lg border p-3"
            rows={4}
            placeholder="Describe the specific records you need..."
            value={data.details}
            onChange={(e) => setData({ ...data, details: e.target.value })}
          />
        </label>
        <label className="field-label md:col-span-2">
          Your name
          <input
            className="mt-2 w-full rounded-lg border p-3"
            placeholder="Your Name"
            value={data.requesterName}
            onChange={(e) => setData({ ...data, requesterName: e.target.value })}
          />
        </label>
      </div>
      <button
        onClick={generate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Generate Letter Template
      </button>
      {letter && (
        <div className="relative">
          <pre className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap text-sm font-sans text-gray-800">
            {letter}
          </pre>
          <CopyButton text={letter} label="Copy letter" className="absolute right-2 top-2" />
        </div>
      )}
    </div>
  );
}
