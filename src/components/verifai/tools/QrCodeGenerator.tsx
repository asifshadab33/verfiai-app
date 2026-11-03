import React, { useState } from 'react';
export default function QrCodeGenerator() {
  const [text, setText] = useState('');
  return (
    <div className="space-y-4">
      <input type="text" className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter URL or text to generate QR code..." value={text} onChange={(e) => setText(e.target.value)} />
      {text && (
        <div className="flex flex-col items-center p-8 bg-white rounded-lg border border-gray-200">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`} alt="QR Code" className="mb-4" />
          <a href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`} download="qrcode.png" className="text-blue-600 hover:text-blue-800 font-medium text-sm">Download QR Code</a>
        </div>
      )}
    </div>
  );
}
