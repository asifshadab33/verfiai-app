import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Removes spoken filler words and accidental repeats ("the the"). Runs free in the browser. */
export function cleanVoiceTranscript(raw: string) {
  const fillers = /\b(uh+|um+|err|ah|you\sknow|so\syeah|basically|eh|este|en\splan)\b[,]?/gi;
  return raw.replace(fillers, "").replace(/\b(\w+)(\s+\1\b)+/gi, "$1").replace(/\s{2,}/g, " ").replace(/\s+([,.?!])/g, "$1").trim();
}

type Rec = { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null };

export function VoiceButton({ lang, onText, disabled }: { lang: string; onText: (text: string) => void; disabled?: boolean }) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef<Rec | null>(null);
  const silence = useRef<number | undefined>(undefined);

  useEffect(() => {
    const w = window as any;
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => { window.clearTimeout(silence.current); recRef.current?.stop(); };
  }, []);

  function stop() { window.clearTimeout(silence.current); recRef.current?.stop(); setListening(false); }
  function armSilence() { window.clearTimeout(silence.current); silence.current = window.setTimeout(stop, 3000); }

  function start() {
    setError("");
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec: Rec = new SR();
    rec.lang = lang; rec.continuous = true; rec.interimResults = false;
    rec.onresult = (e: any) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript + " ";
      const cleaned = cleanVoiceTranscript(text);
      if (cleaned) onText(cleaned);
      armSilence();
    };
    rec.onerror = (e: any) => { setError(e?.error === "not-allowed" ? "Microphone access was blocked. Allow it in your browser settings." : "Voice input stopped. Please try again."); setListening(false); };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try { rec.start(); setListening(true); armSilence(); } catch { setError("Voice input could not start."); }
  }

  if (!supported) return <span className="text-xs text-muted-foreground">Voice input isn't supported in this browser. Try Chrome or Edge.</span>;
  return <span className="inline-flex items-center gap-2">
    <Button type="button" variant={listening ? "default" : "outline"} size="sm" disabled={disabled} aria-pressed={listening} onClick={listening ? stop : start}>
      {listening ? <MicOff /> : <Mic />}{listening ? "Stop listening" : "Speak"}
    </Button>
    {listening && <span role="status" className="text-xs text-brand">Listening… stops after 3 seconds of silence</span>}
    {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
  </span>;
}
