import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { generatePassword } from "@/lib/tools/password-gen";
import { CopyButton } from "./CopyButton";
export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const generate = () => {
    setPassword(generatePassword(length, opts));
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
        <label htmlFor="password-length" className="field-label">
          Length: {length}
        </label>
        <input
          id="password-length"
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
          <CopyButton text={password} label="Copy password" className="shrink-0" />
        </div>
      )}
    </div>
  );
}
