/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Mic, MicOff, Copy, Check } from "lucide-react";

// Type definition for Web Speech API
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (e: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (e: any) => void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function SpeechToText() {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          finalTranscript += event.results[i]?.[0]?.transcript ?? "";
        }
        setText((prev) => prev + (prev ? " " : "") + finalTranscript);
      };
      rec.onend = () => setIsListening(false);
      setRecognition(rec);
    }
  }, []);

  const toggle = () => {
    if (!recognition) return alert("Speech recognition is not supported in this browser.");
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={toggle}
          className={`px-6 py-2 rounded-lg font-medium text-white flex items-center gap-2 ${isListening ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" /> Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" /> Start Dictation
            </>
          )}
        </button>
        {text && (
          <button onClick={copy} className="text-gray-500 hover:text-blue-600">
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
        )}
      </div>
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg"
        rows={8}
        placeholder="Your spoken text will appear here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {!recognition && (
        <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">
          ⚠️ Your browser does not support the Web Speech API. Try Chrome or Edge.
        </p>
      )}
    </div>
  );
}
