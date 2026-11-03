/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { lookupIsbn } from "@/lib/tools/isbn";

export default function IsbnCiter() {
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    if (!isbn.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await lookupIsbn(isbn);
      const key = `ISBN:${isbn.replace(/[^0-9X]/gi, "")}`;
      if (!data[key]) throw new Error("ISBN not found in OpenLibrary.");
      setResult(data[key]);
    } catch (err: any) {
      setError(
        "Failed to fetch. OpenLibrary API may be blocking this request (CORS) or ISBN is invalid.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="isbn-input" className="field-label flex-1">
          ISBN
          <input
            id="isbn-input"
            type="text"
            placeholder="Enter ISBN (e.g., 9780134685991)"
            className="mt-2 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          />
        </label>
        <button
          onClick={handleLookup}
          disabled={loading || !isbn.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lookup"}
        </button>
      </div>
      {error && (
        <div className="bg-gray-50 text-gray-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-gray-200">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h2 className="mb-2 font-bold text-green-900">{result.title}</h2>
          <p className="text-sm text-green-800 mb-1">
            <strong>Authors:</strong> {result.authors?.map((a: any) => a.name).join(", ")}
          </p>
          <p className="text-sm text-green-800 mb-1">
            <strong>Publisher:</strong> {result.publishers?.[0]?.name} ({result.publish_date})
          </p>
          {result.identifiers?.isbn_13 && (
            <p className="text-sm text-green-800">
              <strong>ISBN-13:</strong> {result.identifiers.isbn_13[0]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
