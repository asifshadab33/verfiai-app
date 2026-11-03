import React, { useState } from "react";
import { inspectUrl } from "@/lib/tools/url-inspector";
export default function UrlInspector() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ReturnType<typeof inspectUrl>>(null);
  const analyze = () => setResult(inspectUrl(url));
  return (
    <div className="space-y-4">
      <label className="field-label">
        URL to inspect
        <input
          className="mt-2 w-full rounded-lg border p-3"
          placeholder="Paste URL to inspect..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <button
        onClick={analyze}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
      >
        Inspect URL
      </button>
      {result && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Domain:</strong> {result.domain}
            </div>
            <div>
              <strong>Punycode/IDN:</strong> {result.punycode}
            </div>
          </div>
          {result.trackingParams.length > 0 ? (
            <div>
              <strong className="text-red-800">Tracking Parameters Found:</strong>{" "}
              {result.trackingParams.join(", ")}
            </div>
          ) : (
            <div className="text-green-800 font-medium">
              ✅ No common tracking parameters detected.
            </div>
          )}
          <div>
            <strong>Clean URL:</strong>{" "}
            <code className="block bg-white p-2 rounded border mt-1 text-xs break-all">
              {result.cleanUrl}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
