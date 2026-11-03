import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { generateFoiLetter, FoiData } from "@/lib/tools/foi-letter";
export default function FoiLetter() {
  const [data, setData] = useState<FoiData>({
    country: "",
    agency: "",
    subject: "",
    details: "",
    requesterName: "",
  });
  const [letter, setLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const generate = () => {
    setLetter(generateFoiLetter(data));
    setCopied(false);
  };
  const copy = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="p-3 border border-gray-300 rounded-lg"
          placeholder="Country/Jurisdiction"
          value={data.country}
          onChange={(e) => setData({ ...data, country: e.target.value })}
        />
        <input
          className="p-3 border border-gray-300 rounded-lg"
          placeholder="Agency/Department Name"
          value={data.agency}
          onChange={(e) => setData({ ...data, agency: e.target.value })}
        />
        <input
          className="p-3 border border-gray-300 rounded-lg md:col-span-2"
          placeholder="Subject of Request"
          value={data.subject}
          onChange={(e) => setData({ ...data, subject: e.target.value })}
        />
        <textarea
          className="p-3 border border-gray-300 rounded-lg md:col-span-2"
          rows={4}
          placeholder="Describe the specific records you need..."
          value={data.details}
          onChange={(e) => setData({ ...data, details: e.target.value })}
        />
        <input
          className="p-3 border border-gray-300 rounded-lg md:col-span-2"
          placeholder="Your Name"
          value={data.requesterName}
          onChange={(e) => setData({ ...data, requesterName: e.target.value })}
        />
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
          <button
            onClick={copy}
            className="absolute top-2 right-2 bg-white border border-gray-200 hover:bg-gray-100 p-2 rounded shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
