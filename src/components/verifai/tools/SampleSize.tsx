import React, { useState } from "react";
import { calculateSampleSize } from "@/lib/tools/sample-size";
export default function SampleSize() {
  const [pop, setPop] = useState(10000);
  const [conf, setConf] = useState(95);
  const [margin, setMargin] = useState(5);
  const [result, setResult] = useState<number | null>(null);
  const calc = () => setResult(calculateSampleSize(pop, conf, margin));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="sample-population" className="field-label">
            Population size
          </label>
          <input
            id="sample-population"
            type="number"
            className="mt-2 w-full rounded-lg border p-3"
            value={pop}
            onChange={(e) => setPop(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="sample-confidence" className="field-label">
            Confidence level (%)
          </label>
          <select
            id="sample-confidence"
            className="mt-2 w-full rounded-lg border p-3"
            value={conf}
            onChange={(e) => setConf(Number(e.target.value))}
          >
            <option value={90}>90%</option>
            <option value={95}>95%</option>
            <option value={99}>99%</option>
          </select>
        </div>
        <div>
          <label htmlFor="sample-margin" className="field-label">
            Margin of error (%)
          </label>
          <input
            id="sample-margin"
            type="number"
            className="mt-2 w-full rounded-lg border p-3"
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
          />
        </div>
      </div>
      <button
        onClick={calc}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Calculate Sample Size
      </button>
      {result !== null && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
          <h2 className="mb-1 text-sm font-bold text-blue-900">Required sample size</h2>
          <p className="text-4xl font-bold text-blue-900">{result}</p>
        </div>
      )}
    </div>
  );
}
