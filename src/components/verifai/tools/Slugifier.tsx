import React, { useState } from "react";
import { slugify, encodeUrl } from "@/lib/tools/slugifier";
import { CopyButton } from "./CopyButton";
export default function Slugifier() {
  const [text, setText] = useState("");
  return (
    <div className="space-y-4">
      <label className="field-label">
        Text or URL
        <input
          className="mt-2 w-full rounded-lg border p-3"
          placeholder="Enter text or URL..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      {text && (
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
            <code className="text-sm font-mono break-all">{slugify(text)}</code>
            <CopyButton text={slugify(text)} label="Copy slug" />
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
            <code className="text-sm font-mono break-all">{encodeUrl(text)}</code>
            <CopyButton text={encodeUrl(text)} label="Copy encoded URL" />
          </div>
        </div>
      )}
    </div>
  );
}
