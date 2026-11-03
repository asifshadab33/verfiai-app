import React, { useState } from 'react';
import { unixToDate, dateToUnix } from '@/lib/tools/timestamp';
export default function TimestampConverter() {
  const [unix, setUnix] = useState('');
  const [date, setDate] = useState('');
  const [res1, setRes1] = useState('');
  const [res2, setRes2] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-2">Unix Timestamp to Date</h4>
        <div className="flex gap-2">
          <input className="flex-1 p-3 border border-gray-300 rounded-lg" placeholder="e.g. 1672531200" value={unix} onChange={e => setUnix(e.target.value)} />
          <button onClick={() => setRes1(unix ? unixToDate(Number(unix)) : '')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">Convert</button>
        </div>
        {res1 && <p className="mt-2 text-sm font-mono bg-white p-2 rounded border border-gray-200">{res1}</p>}
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-2">Date to Unix Timestamp</h4>
        <div className="flex gap-2">
          <input type="datetime-local" className="flex-1 p-3 border border-gray-300 rounded-lg" value={date} onChange={e => setDate(e.target.value)} />
          <button onClick={() => setRes2(date ? dateToUnix(date) : null)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">Convert</button>
        </div>
        {res2 !== null && <p className="mt-2 text-sm font-mono bg-white p-2 rounded border border-gray-200">{res2}</p>}
      </div>
    </div>
  );
}
