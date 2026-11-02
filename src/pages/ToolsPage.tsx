import React, { useState } from 'react';
import { BookOpen, Search, Shield, Clock, Image as ImageIcon, Type, AlertTriangle } from 'lucide-react';
import CitationGenerator from '../components/tools/CitationGenerator';
import HeadlineAnalyzer from '../components/tools/HeadlineAnalyzer';
import WeaselWordDetector from '../components/tools/WeaselWordDetector';
import ClaimExtractor from '../components/tools/ClaimExtractor';
import ReverseImageSearch from '../components/tools/ReverseImageSearch';
import ReadingTimeCalculator from '../components/tools/ReadingTimeCalculator';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    { id: 'citation', name: 'Citation Generator', icon: BookOpen, desc: 'Generate APA, MLA, and Chicago citations instantly from a DOI.', category: 'Citation & References' },
    { id: 'headline', name: 'Headline Analyzer', icon: Type, desc: 'Check length, emotional impact, and clickbait patterns.', category: 'Writing & Analysis' },
    { id: 'weasel', name: 'Weasel Word Detector', icon: AlertTriangle, desc: 'Highlight vague phrases like "studies show" or "experts agree".', category: 'Writing & Analysis' },
    { id: 'claim', name: 'Claim Extractor', icon: Search, desc: 'Extract checkable factual statements from any pasted text.', category: 'Verification' },
    { id: 'image', name: 'Reverse Image Search', icon: ImageIcon, desc: 'One-click search across Google Lens, TinEye, and Yandex.', category: 'Verification' },
    { id: 'reading', name: 'Reading Time Calculator', icon: Clock, desc: 'Calculate reading and speaking time for any text.', category: 'Writing & Analysis' },
  ];

  const renderTool = () => {
    switch (activeTool) {
      case 'citation': return <CitationGenerator />;
      case 'headline': return <HeadlineAnalyzer />;
      case 'weasel': return <WeaselWordDetector />;
      case 'claim': return <ClaimExtractor />;
      case 'image': return <ReverseImageSearch />;
      case 'reading': return <ReadingTimeCalculator />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Free Research & Verification Tools</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          100% free, no account required. Built to help students, journalists, and researchers verify, cite, and analyze with confidence.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`text-left p-6 rounded-xl border transition-all ${
              activeTool === tool.id 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <tool.icon className={`w-8 h-8 mb-4 ${activeTool === tool.id ? 'text-blue-600' : 'text-gray-500'}`} />
            <h3 className="font-bold text-gray-900 mb-2">{tool.name}</h3>
            <p className="text-sm text-gray-600">{tool.desc}</p>
            <span className="inline-block mt-3 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {tool.category}
            </span>
          </button>
        ))}
      </div>

      {activeTool && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {tools.find(t => t.id === activeTool)?.name}
            </h2>
            <button 
              onClick={() => setActiveTool(null)}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm"
            >
              Close Tool
            </button>
          </div>
          {renderTool()}
        </div>
      )}
    </div>
  );
}
