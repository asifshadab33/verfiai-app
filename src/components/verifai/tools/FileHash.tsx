import React, { useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { computeSHA256 } from "@/lib/tools/file-hash";
export default function FileHash() {
  const [file, setFile] = useState<File | null>(null);
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [loading, setLoading] = useState(false);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    setActual("");
    try {
      const hash = await computeSHA256(f);
      setActual(hash);
    } catch {
      setActual("Error computing hash.");
    } finally {
      setLoading(false);
    }
  };
  const isMatch = actual && expected && actual.toLowerCase() === expected.toLowerCase();
  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleFile}
        className="w-full p-2 border border-gray-300 rounded-lg"
      />
      <input
        type="text"
        placeholder="Paste expected SHA-256 hash here..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
        value={expected}
        onChange={(e) => setExpected(e.target.value)}
      />
      {loading && (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" /> Computing SHA-256...
        </div>
      )}
      {actual && (
        <div
          className={`p-4 rounded-lg border ${isMatch ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
        >
          <h4
            className={`font-bold mb-2 flex items-center gap-2 ${isMatch ? "text-green-800" : "text-yellow-800"}`}
          >
            {isMatch ? (
              <>
                <Check className="w-5 h-5" /> Hash Matches!
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" /> Hash Mismatch or Not Provided
              </>
            )}
          </h4>
          <p className="text-xs text-gray-600 mb-1">Actual SHA-256:</p>
          <code className="block bg-white p-2 rounded border border-gray-200 text-xs font-mono break-all">
            {actual}
          </code>
        </div>
      )}
    </div>
  );
}
