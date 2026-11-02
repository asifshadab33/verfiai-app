import React, { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';

export default function ReverseImageSearch() {
  const [imageUrl, setImageUrl] = useState('');

  const engines = [
    { name: 'Google Lens', url: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`, color: 'bg-blue-600' },
    { name: 'TinEye', url: `https://tineye.com/search?url=${encodeURIComponent(imageUrl)}`, color: 'bg-orange-600' },
    { name: 'Yandex Images', url: `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}`, color: 'bg-red-600' },
    { name: 'Bing Visual', url: `https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP&sbisrc=UrlPaste&imgurl=${encodeURIComponent(imageUrl)}`, color: 'bg-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Paste image URL here (e.g., https://example.com/image.jpg)" 
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      {imageUrl && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {engines.map((engine) => (
            <a 
              key={engine.name}
              href={engine.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${engine.color} hover:opacity-90 text-white p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-opacity`}
            >
              <Search className="w-6 h-6" />
              <span className="font-semibold text-sm">{engine.name}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 text-center">Note: For local files, upload the image to a free host like imgur.com first, then paste the URL.</p>
    </div>
  );
}
