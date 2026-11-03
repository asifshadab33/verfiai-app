import React, { useState } from "react";
import { inspectUrl } from "@/lib/tools/url-inspector";
export default function UrlInspector() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ReturnType<typeof inspectUrl>>(null);
  const analyze = () => setResult(inspectUrl(url));
  return (
    <div className="space-y-4">
      <input
        className="w-full p-3 border border-gray-300 rounded-lg"
        placeholder="Paste URL to inspect..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
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
              <strong className="text-red-700">Tracking Parameters Found:</strong>{" "}
              {result.trackingParams.join(", ")}
            </div>
          ) : (
            <div className="text-green-700 font-medium">
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
