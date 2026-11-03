import React, { useState } from "react";
import { unixToDate, dateToUnix } from "@/lib/tools/timestamp";
export default function TimestampConverter() {
  const [unix, setUnix] = useState("");
  const [date, setDate] = useState("");
  const [res1, setRes1] = useState("");
  const [res2, setRes2] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h2 className="mb-2 font-bold text-gray-900">Unix timestamp to date</h2>
        <div className="flex gap-2">
          <label className="field-label flex-1">
            Unix timestamp
            <input
              className="mt-2 w-full rounded-lg border p-3"
              placeholder="e.g. 1672531200"
              value={unix}
              onChange={(e) => setUnix(e.target.value)}
            />
          </label>
          <button
            onClick={() => setRes1(unix ? unixToDate(Number(unix)) : "")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Convert
          </button>
        </div>
        {res1 && (
          <p className="mt-2 text-sm font-mono bg-white p-2 rounded border border-gray-200">
            {res1}
          </p>
        )}
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h2 className="mb-2 font-bold text-gray-900">Date to Unix timestamp</h2>
        <div className="flex gap-2">
          <label className="field-label flex-1">
            Date and time
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-lg border p-3"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <button
            onClick={() => setRes2(date ? dateToUnix(date) : null)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Convert
          </button>
        </div>
        {res2 !== null && (
          <p className="mt-2 text-sm font-mono bg-white p-2 rounded border border-gray-200">
            {res2}
          </p>
        )}
      </div>
    </div>
  );
}
