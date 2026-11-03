import React, { useState, useEffect } from "react";
import { Play, Square } from "lucide-react";
export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggle = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg"
        rows={5}
        placeholder="Enter text to read aloud..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-4">
        <select
          className="flex-1 p-2 border border-gray-300 rounded-lg"
          onChange={(e) => setSelectedVoice(voices.find((v) => v.name === e.target.value) || null)}
          value={selectedVoice?.name || ""}
        >
          <option value="">Default Voice</option>
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
        <button
          onClick={toggle}
          className={`px-6 py-2 rounded-lg font-medium text-white flex items-center gap-2 ${isSpeaking ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {isSpeaking ? (
            <>
              <Square className="w-4 h-4" /> Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Speak
            </>
          )}
        </button>
      </div>
    </div>
  );
}
