import { useEffect, useRef, useState } from "react";
import { Info, Loader2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** Removes spoken filler words and accidental repeats ("the the"). Runs free in the browser. */
export function cleanVoiceTranscript(raw: string) {
  const fillers = /\b(uh+|um+|err|ah|you\sknow|so\syeah|basically|eh|este|en\splan)\b[,]?/gi;
  return raw.replace(fillers, "").replace(/\b(\w+)(\s+\1\b)+/gi, "$1").replace(/\s{2,}/g, " ").replace(/\s+([,.?!])/g, "$1").trim();
}

/** BCP-47 tags for the speech recognizer; defaults to a regional variant where helpful. */
const SPEECH_LANGS: Record<string, string> = { ar: "ar-QA", ur: "ur-PK", fa: "fa-IR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", pt: "pt-BR", it: "it-IT", nl: "nl-NL", ru: "ru-RU", tr: "tr-TR", hi: "hi-IN", bn: "bn-IN", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", id: "id-ID", sw: "sw-KE" };
export const speechLang = (lang: string) => SPEECH_LANGS[lang] ?? lang;
export const isRtlLang = (lang: string) => ["ar", "ur", "fa"].includes(lang);

type Rec = { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null };

const PRIVACY_NOTE = "Audio is processed by your browser's speech service and is not saved to our servers.";

export function VoiceButton({ lang, onText, disabled, label = "Speak" }: { lang: string; onText: (text: string) => void; disabled?: boolean; label?: string }) {
  const [supported, setSupported] = useState(true);
  const [phase, setPhase] = useState<"idle" | "listening" | "processing">("idle");
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState("");
  const [interim, setInterim] = useState("");
  const recRef = useRef<Rec | null>(null);
  const silence = useRef<number | undefined>(undefined);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const w = window as any;
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => { window.clearTimeout(silence.current); recRef.current?.stop(); };
  }, []);

  // Escape key stops recording
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && phaseRef.current !== "idle") stop();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function stop() {
    window.clearTimeout(silence.current);
    recRef.current?.stop();
    setInterim("");
    setPhase("idle");
    setAnnouncement("Listening stopped");
  }
  // Only armed after speech is actually detected, so the mic never cuts off
  // before the user has started talking. 6s of silence ends the session.
  function armSilence() { window.clearTimeout(silence.current); silence.current = window.setTimeout(stop, 6000); }

  function start() {
    setError("");
    setInterim("");
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec: Rec = new SR();
    rec.lang = speechLang(lang); rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e: any) => {
      let finalText = "";
      let interimText = "";
      let heard = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        heard = true;
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
      }
      for (let i = 0; i < e.results.length; i++) {
        if (!e.results[i].isFinal) interimText += e.results[i][0].transcript + " ";
      }
      if (heard) setPhase("processing");
      const cleaned = cleanVoiceTranscript(finalText);
      if (cleaned) onText(cleaned);
      setInterim(interimText.trim());
      setPhase("listening");
      // Speech detected — from here on, 6s of silence stops listening.
      armSilence();
    };
    rec.onerror = (e: any) => {
      const kind = e?.error;
      setError(
        kind === "not-allowed" || kind === "service-not-allowed"
          ? "Microphone access was blocked. Allow it in your browser settings, then try again."
          : kind === "no-speech"
            ? "No speech was heard. Try speaking closer to the microphone."
            : kind === "network"
              ? "Voice input needs an internet connection. Check your connection and try again."
              : "Voice input stopped unexpectedly. Please try again.",
      );
      setPhase("idle");
      setInterim("");
      setAnnouncement("Listening stopped");
    };
    rec.onend = () => { window.clearTimeout(silence.current); setInterim(""); setPhase((p) => { if (p !== "idle") setAnnouncement("Listening stopped"); return "idle"; }); };
    recRef.current = rec;
    // No silence timer here: it starts only once speech is detected.
    try { rec.start(); setPhase("listening"); setAnnouncement("Listening started"); } catch { setError("Voice input could not start. Please try again."); }
  }

  const infoIcon = (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} role="img" aria-label={PRIVACY_NOTE} className="inline-flex size-5 cursor-help items-center justify-center rounded-full text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Info className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">{PRIVACY_NOTE}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (!supported) {
    return (
      <span className="inline-flex items-center gap-2">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button type="button" variant="outline" size="sm" disabled aria-hidden="true" className="pointer-events-none opacity-50">
                  <Mic />{label}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Voice input is natively supported in Chrome, Edge, and Safari.</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="sr-only">Voice input is natively supported in Chrome, Edge, and Safari.</span>
        {infoIcon}
      </span>
    );
  }

  const listening = phase === "listening";
  const processing = phase === "processing";
  const active = phase !== "idle";

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button type="button" variant={active ? "default" : "outline"} size="sm" disabled={disabled} aria-pressed={active} onClick={active ? stop : start}>
        {listening ? <MicOff /> : processing ? <Loader2 className="animate-spin" /> : <Mic />}
        {listening ? "Stop listening" : processing ? "Processing…" : label}
      </Button>
      {listening && (
        <span className="inline-flex items-center gap-1.5 text-xs text-brand">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
          </span>
          Listening… stops after 6 seconds of silence (Esc to stop)
        </span>
      )}
      {processing && <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" />Processing speech…</span>}
      {interim && <span role="status" aria-live="polite" className="max-w-48 truncate text-xs text-muted-foreground" title={interim}>{interim}</span>}
      {infoIcon}
      <span aria-live="polite" className="sr-only">{announcement}</span>
      {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
