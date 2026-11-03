import React, { useState } from 'react';
import { basicMarkdownToHtml } from '@/lib/tools/markdown';
export default function MarkdownEditor() {
  const [text, setText] = useState('# Hello World\n\nType **markdown** here.');
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-bold text-gray-900 mb-2">Editor</h4>
        <textarea className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm" rows={12} value={text} onChange={e => setText(e.target.value)} />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-2">Preview</h4>
        <div className="w-full p-3 border border-gray-300 rounded-lg bg-white min-h-[300px] prose prose-sm" dangerouslySetInnerHTML={{ __html: basicMarkdownToHtml(text) }} />
      </div>
    </div>
  );
}
