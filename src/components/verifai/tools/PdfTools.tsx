import React, { useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { mergePdfs, splitPdf, rotatePdf } from '@/lib/tools/pdf-tools';
export default function PdfTools() {
  const [mode, setMode] = useState<'merge' | 'split' | 'rotate'>('merge');
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState('');
  const [pageStr, setPageStr] = useState('');
  const [rot, setRot] = useState(90);

  const process = async () => {
    setError(''); setResult(null);
    try {
      let res: Uint8Array | undefined;
      if (mode === 'merge' && files.length > 1) res = await mergePdfs(files);
      else if (mode === 'split' && files.length === 1 && pageStr) res = await splitPdf(files[0], pageStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)));
      else if (mode === 'rotate' && files.length === 1) res = await rotatePdf(files[0], rot);
      else setError('Invalid input.');
      if (res) setResult(res);
    } catch { setError('Failed to process PDF.'); }
  };

  const download = () => { if (!result) return; const blob = new Blob([result], { type: 'application/pdf' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `processed-${Date.now()}.pdf`; a.click(); };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['merge', 'split', 'rotate'].map(m => <button key={m} onClick={() => { setMode(m as any); setFiles([]); setResult(null); }} className={`px-4 py-2 rounded-lg font-medium capitalize ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{m} PDFs</button>)}
      </div>
      <input type="file" accept=".pdf" aria-label="Select PDF files" multiple={mode === 'merge'} onChange={e => setFiles(Array.from(e.target.files || []))} className="w-full p-3 border border-gray-300 rounded-lg" />
      {mode === 'split' && <input placeholder="Pages: 1, 3, 5" aria-label="Page numbers to split" value={pageStr} onChange={e => setPageStr(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />}
      {mode === 'rotate' && <select value={rot} aria-label="Rotation degrees" onChange={e => setRot(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg"><option value={90}>90° CW</option><option value={180}>180°</option><option value={270}>90° CCW</option></select>}
      <button onClick={process} disabled={files.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">Process</button>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
      {result && <button onClick={download} className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Download</button>}
    </div>
  );
}
