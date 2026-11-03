import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { buildMailtoLink, MailtoData } from "@/lib/tools/mailto-builder";
import { CopyButton } from "./CopyButton";
export default function MailtoBuilder() {
  const [data, setData] = useState<MailtoData>({ to: "", cc: "", bcc: "", subject: "", body: "" });
  const [link, setLink] = useState("");
  const generate = () => {
    setLink(buildMailtoLink(data));
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(
          [
            ["to", "To (required)", "to"],
            ["cc", "CC", "cc"],
            ["bcc", "BCC", "bcc"],
            ["subject", "Subject", "subject"],
          ] as const
        ).map(([key, label, placeholder]) => (
          <label key={key} className="field-label">
            {label}
            <input
              className="mt-2 w-full rounded-lg border p-3"
              placeholder={placeholder}
              value={data[key]}
              onChange={(e) => setData({ ...data, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="field-label md:col-span-2">
          Message body
          <textarea
            className="mt-2 w-full rounded-lg border p-3"
            rows={3}
            placeholder="Body"
            value={data.body}
            onChange={(e) => setData({ ...data, body: e.target.value })}
          />
        </label>
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
          <div className="flex flex-wrap gap-2">
            <CopyButton text={link} label="Copy mailto link" />
            <a
              href={link}
              aria-label="Open mailto link"
              className="inline-flex min-w-11 min-h-11 items-center justify-center text-blue-700 hover:text-blue-900"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
