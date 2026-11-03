import React, { useState } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';

export default function FileHashVerifier() {
  const [file, setFile] = useState<File | null>(null);
  const [expectedHash, setExpectedHash] = useState('');
  const [actualHash, setActualHash] = useState('');
  const [loading, setLoading] = useState(false);

  const computeHash = async (file: File) => {
    setLoading(true);
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setActualHash(hashHex);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setActualHash('');
      computeHash(e.target.files[0]);
    }
  };

  const isMatch = actualHash && expectedHash && actualHash.toLowerCase() === expectedHash.toLowerCase();

  return (
    <div className="space-y-4">
      <input type="file" onChange={handleFileChange} className="w-full p-2 border border-gray-300 rounded-lg" />
      <div className="flex gap-2">
        <input type="text" placeholder="Paste expected SHA-256 hash here..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" value={expectedHash} onChange={(e) => setExpectedHash(e.target.value)} />
      </div>
      {loading && <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Computing SHA-256 hash...</div>}
      {actualHash && (
        <div className={`p-4 rounded-lg border ${isMatch ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <h4 className={`font-bold mb-2 flex items-center gap-2 ${isMatch ? 'text-green-800' : 'text-yellow-800'}`}>
            {isMatch ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {isMatch ? 'Hash Matches!' : 'Hash Mismatch or Not Provided'}
          </h4>
          <p className="text-xs text-gray-600 mb-1">Actual SHA-256:</p>
          <code className="block bg-white p-2 rounded border border-gray-200 text-xs font-mono break-all">{actualHash}</code>
        </div>
      )}
    </div>
  );
}
