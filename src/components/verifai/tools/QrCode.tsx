import React, { useState } from 'react';
import { Download } from 'lucide-react';
export default function QrCode() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const url = text ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}` : '';
  return (
    <div className="space-y-4">
      <textarea className="w-full p-3 border border-gray-300 rounded-lg" rows={3} placeholder="Enter URL or text to generate QR code..." value={text} onChange={e => setText(e.target.value)} />
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Size:</label>
        <select className="p-2 border border-gray-300 rounded-lg" value={size} onChange={e => setSize(Number(e.target.value))}>
          <option value={150}>150x150</option><option value={200}>200x200</option><option value={300}>300x300</option>
        </select>
      </div>
      {url && (
        <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200">
          <img src={url} alt="Generated QR Code" className="mb-4" />
          <a href={url} download="qrcode.png" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm">
            <Download className="w-4 h-4" /> Download PNG
          </a>
        </div>
      )}
    </div>
  );
}
