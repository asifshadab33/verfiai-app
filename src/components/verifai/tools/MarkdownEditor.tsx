import React, { useState } from "react";
import { basicMarkdownToHtml } from "@/lib/tools/markdown";
export default function MarkdownEditor() {
  const [text, setText] = useState("# Hello World\n\nType **markdown** here.");
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="field-label">
          Markdown editor
          <textarea
            className="mt-2 w-full rounded-lg border p-3 font-mono text-sm"
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
      </div>
      <div>
        <h2 className="mb-2 font-bold text-gray-900">Preview</h2>
        <div
          className="w-full min-h-[300px] rounded-lg border bg-white p-3 prose prose-sm"
          dangerouslySetInnerHTML={{ __html: basicMarkdownToHtml(text) }}
        />
      </div>
    </div>
  );
}
