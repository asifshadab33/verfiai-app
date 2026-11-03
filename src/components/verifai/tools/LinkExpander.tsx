import React, { useState } from "react";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
export default function LinkExpander() {
  const [url, setUrl] = useState("");
  const [finalUrl, setFinalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const expand = async () => {
    setLoading(true);
    setError("");
    setFinalUrl("");
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      setFinalUrl(res.url);
    } catch {
      setError(
        "Failed to expand. The target server likely blocks browser requests (CORS). Per project rules, this tool is skipped for this URL.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          className="flex-1 p-3 border border-gray-300 rounded-lg"
          placeholder="Paste shortened URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={expand}
          disabled={loading || !url}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Expand"}
        </button>
      </div>
      {error && (
        <div className="bg-gray-50 text-gray-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-gray-200">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      {finalUrl && finalUrl !== url && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h4 className="font-bold text-green-800 mb-2">✅ Final Destination:</h4>
          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all flex items-center gap-2"
          >
            {finalUrl} <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
