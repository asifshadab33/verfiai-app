import React, { useState } from 'react';
import { Loader2, Copy, Check, AlertCircle } from 'lucide-react';

export default function CitationGenerator() {
  const [doi, setDoi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [citationData, setCitationData] = useState<any>(null);
  const [copiedStyle, setCopiedStyle] = useState('');

  const fetchCitation = async () => {
    if (!doi.trim()) return;
    setLoading(true);
    setError('');
    setCitationData(null);
    try {
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').trim();
      const response = await fetch(`https://api.crossref.org/works/${cleanDoi}`);
      if (!response.ok) throw new Error('DOI not found. Please check the number and try again.');
      const data = await response.json();
      setCitationData(data.message);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch citation data.');
    } finally {
      setLoading(false);
    }
  };

  const generateCitation = (style: 'apa' | 'mla' | 'chicago') => {
    if (!citationData) return '';
    const authors = citationData.author?.map((a: any) => `${a.family}, ${a.given?.charAt(0)}.`).join(', ') || 'Unknown Author';
    const year = citationData.published?.['date-parts']?.[0]?.[0] || citationData.created?.['date-parts']?.[0]?.[0] || 'n.d.';
    const title = citationData.title?.[0] || 'Unknown Title';
    const journal = citationData['container-title']?.[0] || '';
    const volume = citationData.volume || '';
    const issue = citationData.issue || '';
    const pages = citationData.page || '';
    const doiLink = citationData.DOI ? `https://doi.org/${citationData.DOI}` : '';

    if (style === 'apa') return `${authors} (${year}). ${title}. ${journal}${volume ? `, ${volume}` : ''}${issue ? `(${issue})` : ''}${pages ? `, ${pages}` : ''}. ${doiLink}`;
    if (style === 'mla') return `${authors}. "${title}." ${journal}${volume ? `, vol. ${volume}` : ''}${issue ? `, no. ${issue}` : ''}, ${year}, pp. ${pages}. ${doiLink}`;
    if (style === 'chicago') return `${authors}. "${title}." ${journal}${volume ? ` ${volume}` : ''}${issue ? `, no. ${issue}` : ''} (${year}): ${pages}. ${doiLink}`;
    return '';
  };

  const copyToClipboard = (text: string, style: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStyle(style);
    setTimeout(() => setCopiedStyle(''), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="text" placeholder="e.g., 10.1038/nature12345" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={doi} onChange={(e) => setDoi(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchCitation()} />
        <button onClick={fetchCitation} disabled={loading || !doi.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
        </button>
      </div>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
      {citationData && (
        <div className="space-y-4">
          {['apa', 'mla', 'chicago'].map((style) => (
            <div key={style} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{style.toUpperCase()} Format</span>
                <button onClick={() => copyToClipboard(generateCitation(style as any), style)} className="text-gray-500 hover:text-blue-600">
                  {copiedStyle === style ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-800 font-mono break-words">{generateCitation(style as any)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
