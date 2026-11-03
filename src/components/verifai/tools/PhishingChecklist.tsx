import React, { useState } from "react";
const flags = [
  'Urgent or threatening language ("Act now or your account will be closed")',
  'Generic greeting ("Dear Customer" instead of your name)',
  "Suspicious sender email address (misspellings of legitimate domains)",
  "Requests for sensitive information (passwords, SSN, credit card)",
  "Unexpected attachments or links to unknown domains",
  "Poor grammar or spelling mistakes",
  "Mismatched URL (hovering shows a different domain than the link text)",
  "Unusual request for gift cards or wire transfers",
];
export default function PhishingChecklist() {
  const [checked, setChecked] = useState<boolean[]>(new Array(flags.length).fill(false));
  const toggle = (i: number) => {
    const n = [...checked];
    n[i] = !n[i];
    setChecked(n);
  };
  const score = checked.filter(Boolean).length;
  const risk = score >= 5 ? "High" : score >= 2 ? "Medium" : "Low";
  const color = score >= 5 ? "red" : score >= 2 ? "yellow" : "green";
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {flags.map((flag, i) => (
          <label
            key={i}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
          >
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              className="mt-1 h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-800">{flag}</span>
          </label>
        ))}
      </div>
      <div className={`p-4 rounded-lg border bg-${color}-50 border-${color}-200`}>
        <h4 className={`font-bold text-${color}-800`}>
          Risk Level: {risk} ({score}/{flags.length} flags)
        </h4>
        <p className={`text-sm text-${color}-700 mt-1`}>
          {score >= 5
            ? "Do not click links or reply. Verify directly with the organization."
            : score >= 2
              ? "Proceed with caution. Verify the sender independently."
              : "Few red flags detected, but always stay vigilant."}
        </p>
      </div>
    </div>
  );
}
