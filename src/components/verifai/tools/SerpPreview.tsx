import React, { useState } from "react";
export default function SerpPreview() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <input
          className="w-full p-3 border border-gray-300 rounded-lg"
          placeholder="Page Title (Max 60 chars)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={70}
        />
        <input
          className="w-full p-3 border border-gray-300 rounded-lg"
          placeholder="URL / Slug"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={3}
          placeholder="Meta Description (Max 160 chars)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          maxLength={170}
        />
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4 text-sm">Google Search Preview</h4>
        <div className="max-w-[600px]">
          <div className="text-sm text-[#202124] truncate mb-1">
            {url || "https://example.com/page"}
          </div>
          <div className="text-xl text-[#1a0dab] hover:underline truncate cursor-pointer font-medium">
            {title || "Your Page Title Will Appear Here"}
          </div>
          <div className="text-sm text-[#4d5156] mt-1 line-clamp-2">
            {desc ||
              "Your meta description will appear here. Keep it under 160 characters for best results."}
          </div>
        </div>
      </div>
    </div>
  );
}
