import React, { useState } from 'react';
import { calculateSampleSize } from '@/lib/tools/sample-size';
export default function SampleSize() {
  const [pop, setPop] = useState(10000);
  const [conf, setConf] = useState(95);
  const [margin, setMargin] = useState(5);
  const [result, setResult] = useState<number | null>(null);
  const calc = () => setResult(calculateSampleSize(pop, conf, margin));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium mb-1">Population Size</label><input type="number" className="w-full p-3 border border-gray-300 rounded-lg" value={pop} onChange={e => setPop(Number(e.target.value))} /></div>
        <div><label className="block text-sm font-medium mb-1">Confidence Level (%)</label><select className="w-full p-3 border border-gray-300 rounded-lg" value={conf} onChange={e => setConf(Number(e.target.value))}><option value={90}>90%</option><option value={95}>95%</option><option value={99}>99%</option></select></div>
        <div><label className="block text-sm font-medium mb-1">Margin of Error (%)</label><input type="number" className="w-full p-3 border border-gray-300 rounded-lg" value={margin} onChange={e => setMargin(Number(e.target.value))} /></div>
      </div>
      <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Calculate Sample Size</button>
      {result !== null && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
          <p className="text-sm text-blue-800 mb-1">Required Sample Size:</p>
          <p className="text-4xl font-bold text-blue-900">{result}</p>
        </div>
      )}
    </div>
  );
}
