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
      <label className="field-label">
        Text to read aloud
        <textarea
          className="mt-2 w-full rounded-lg border p-3"
          rows={5}
          placeholder="Enter text to read aloud..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="flex gap-4">
        <label className="field-label flex-1">
          Reading voice
          <select
            className="mt-2 w-full rounded-lg border p-2"
            onChange={(e) =>
              setSelectedVoice(voices.find((v) => v.name === e.target.value) || null)
            }
            value={selectedVoice?.name || ""}
          >
            <option value="">Default Voice</option>
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={toggle}
          disabled={!text.trim()}
          className={`mt-6 min-h-11 rounded-lg px-6 py-2 font-medium text-white flex items-center gap-2 ${isSpeaking ? "bg-red-700 hover:bg-red-800" : "bg-blue-700 hover:bg-blue-800"} disabled:opacity-50`}
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
