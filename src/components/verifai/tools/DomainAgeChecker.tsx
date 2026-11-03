/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Loader2, AlertCircle, Shield } from "lucide-react";
import { checkDomainAge } from "@/lib/tools/domain-age";

export default function DomainAgeChecker() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await checkDomainAge(domain);
      const events = data.events || [];
      const regEvent = events.find((e: any) => e.eventAction === "registration");
      const date = regEvent ? new Date(regEvent.eventDate).toLocaleDateString() : "Unknown";
      setResult({ domain: domain.replace(/^https?:\/\//, "").replace(/\/.*$/, ""), date });
    } catch (err: any) {
      setError("Could not fetch domain data. RDAP API may be blocking this request (CORS).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="domain-age-input" className="field-label flex-1">
          Domain name
          <input
            id="domain-age-input"
            type="text"
            placeholder="example.com"
            className="mt-2 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          />
        </label>
        <button
          onClick={handleCheck}
          disabled={loading || !domain.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
        </button>
      </div>
      {error && (
        <div className="bg-gray-50 text-gray-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-gray-200">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      {result && (
        <div
          className={`p-4 rounded-lg border ${new Date(result.date).getFullYear() >= new Date().getFullYear() - 1 ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}
        >
          <h2
            className={`mb-2 flex items-center gap-2 font-bold ${new Date(result.date).getFullYear() >= new Date().getFullYear() - 1 ? "text-yellow-900" : "text-green-900"}`}
          >
            <Shield className="w-4 h-4" /> Domain Registration Info
          </h2>
          <p
            className={`text-sm ${new Date(result.date).getFullYear() >= new Date().getFullYear() - 1 ? "text-yellow-900" : "text-green-900"}`}
          >
            <strong>{result.domain}</strong> was registered on: <strong>{result.date}</strong>
          </p>
          {new Date(result.date).getFullYear() >= new Date().getFullYear() - 1 && (
            <p className="text-xs text-yellow-800 mt-2 font-medium">
              ⚠️ Warning: This is a newly registered domain. Verify its claims carefully.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
