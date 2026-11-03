import React, { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { generatePassword } from "@/lib/tools/password-gen";
export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [copied, setCopied] = useState(false);
  const generate = () => {
    setPassword(generatePassword(length, opts));
    setCopied(false);
  };
  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(opts).map(([key, val]) => (
          <label
            key={key}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={val}
              onChange={() => setOpts({ ...opts, [key]: !val })}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-sm capitalize">{key}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Length: {length}</label>
        <input
          type="range"
          min="8"
          max="64"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="flex-1"
        />
      </div>
      <button
        onClick={generate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" /> Generate Secure Password
      </button>
      {password && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between gap-4">
          <code className="text-sm text-gray-800 break-all font-mono">{password}</code>
          <button onClick={copy} className="text-gray-500 hover:text-blue-600 flex-shrink-0">
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  );
}
