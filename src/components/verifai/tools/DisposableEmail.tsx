import React, { useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { isDisposableEmail } from "@/lib/tools/disposable-email";
export default function DisposableEmail() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const check = () => setResult(email.includes("@") ? isDisposableEmail(email) : null);
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="email"
          className="flex-1 p-3 border border-gray-300 rounded-lg"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
        />
        <button
          onClick={check}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Check
        </button>
      </div>
      {result !== null && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-3 ${result ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"}`}
        >
          {result ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <p className="font-medium">
            {result
              ? "This is a known disposable email domain."
              : "This domain is not in our disposable list."}
          </p>
        </div>
      )}
    </div>
  );
}
