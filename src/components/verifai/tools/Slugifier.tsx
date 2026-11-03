import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { slugify, encodeUrl, decodeUrl } from "@/lib/tools/slugifier";
export default function Slugifier() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState("");
  const copy = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };
  return (
    <div className="space-y-4">
      <input
        className="w-full p-3 border border-gray-300 rounded-lg"
        placeholder="Enter text or URL..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {text && (
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
            <code className="text-sm font-mono break-all">{slugify(text)}</code>
            <button
              onClick={() => copy(slugify(text), "1")}
              className="text-gray-500 hover:text-blue-600"
            >
              {copied === "1" ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
            <code className="text-sm font-mono break-all">{encodeUrl(text)}</code>
            <button
              onClick={() => copy(encodeUrl(text), "2")}
              className="text-gray-500 hover:text-blue-600"
            >
              {copied === "2" ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
