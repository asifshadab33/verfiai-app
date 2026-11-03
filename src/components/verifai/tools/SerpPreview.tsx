import React, { useState } from "react";
export default function SerpPreview() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="field-label">
          Page title (up to 70 characters)
          <input
            className="mt-2 w-full rounded-lg border p-3"
            placeholder="Page Title (Max 60 chars)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={70}
          />
        </label>
        <label className="field-label">
          URL or slug
          <input
            className="mt-2 w-full rounded-lg border p-3"
            placeholder="URL / Slug"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <label className="field-label">
          Meta description (up to 170 characters)
          <textarea
            className="mt-2 w-full rounded-lg border p-3"
            rows={3}
            placeholder="Meta Description (Max 160 chars)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            maxLength={170}
          />
        </label>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="mb-4 text-sm font-bold text-gray-900">Google Search Preview</h2>
        <div className="max-w-[600px]">
          <div className="mb-1 truncate text-sm text-[#202124]">
            {url || "https://example.com/page"}
          </div>
          <div className="cursor-pointer truncate text-xl font-medium text-[#1a0dab] hover:underline">
            {title || "Your Page Title Will Appear Here"}
          </div>
          <div className="mt-1 line-clamp-2 text-sm text-[#4d5156]">
            {desc ||
              "Your meta description will appear here. Keep it under 160 characters for best results."}
          </div>
        </div>
      </div>
    </div>
  );
}
