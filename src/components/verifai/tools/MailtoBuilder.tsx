import React, { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { buildMailtoLink, MailtoData } from "@/lib/tools/mailto-builder";
export default function MailtoBuilder() {
  const [data, setData] = useState<MailtoData>({ to: "", cc: "", bcc: "", subject: "", body: "" });
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const generate = () => {
    setLink(buildMailtoLink(data));
    setCopied(false);
  };
  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="p-3 border border-gray-300 rounded-lg"
          placeholder="To (required)"
          value={data.to}
          onChange={(e) => setData({ ...data, to: e.target.value })}
        />
        <input
          className="p-3 border border-gray-300 rounded-lg"
          placeholder="CC"
          value={data.cc}
          onChange={(e) => setData({ ...data, cc: e.target.value })}
        />
        <input
          className="p-3 border border-gray-300 rounded-lg"
          placeholder="BCC"
          value={data.bcc}
          onChange={(e) => setData({ ...data, bcc: e.target.value })}
        />
        <input
          className="p-3 border border-gray-300 rounded-lg"
          placeholder="Subject"
          value={data.subject}
          onChange={(e) => setData({ ...data, subject: e.target.value })}
        />
        <textarea
          className="p-3 border border-gray-300 rounded-lg md:col-span-2"
          rows={3}
          placeholder="Body"
          value={data.body}
          onChange={(e) => setData({ ...data, body: e.target.value })}
        />
      </div>
      <button
        onClick={generate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Generate Mailto Link
      </button>
      {link && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between gap-4">
          <code className="text-sm text-gray-800 font-mono break-all">{link}</code>
          <div className="flex gap-2">
            <button onClick={copy} className="text-gray-500 hover:text-blue-600">
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
            <a href={link} className="text-blue-600 hover:text-blue-800">
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
