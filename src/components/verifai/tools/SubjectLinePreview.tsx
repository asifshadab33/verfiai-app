import React, { useState } from "react";
export default function SubjectLinePreview() {
  const [text, setText] = useState("");
  const len = text.length;
  const gmailCutoff = 70;
  const mobileCutoff = 40;
  return (
    <div className="space-y-4">
      <label className="field-label">
        Email subject line
        <input
          className="mt-2 w-full rounded-lg border p-3"
          placeholder="Enter your email subject line..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Length:</span>
          <span
            className={len > gmailCutoff ? "text-red-800 font-bold" : "text-green-800 font-bold"}
          >
            {len} characters
          </span>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-700 mb-1">Desktop Preview (Gmail cutoff ~70 chars):</p>
          <p className="font-medium text-gray-900 truncate">
            {text || "Your subject line will appear here..."}
          </p>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-700 mb-1">Mobile Preview (Cutoff ~40 chars):</p>
          <p className="font-medium text-gray-900 truncate">
            {text || "Your subject line will appear here..."}
          </p>
        </div>
        {len > gmailCutoff && (
          <p className="text-xs text-red-800 font-medium">
            ⚠️ Subject is too long and may be cut off in most inboxes.
          </p>
        )}
      </div>
    </div>
  );
}
