import { useEffect, useRef, useState } from "react";
import { Info, Loader2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** Removes spoken filler words and accidental repeats ("the the"). Runs free in the browser. */
export function cleanVoiceTranscript(raw: string) {
  const fillers = /\b(uh+|um+|err|ah|you\sknow|so\syeah|basically|eh|este|en\splan)\b[,]?/gi;
  return raw
    .replace(fillers, "")
    .replace(/\b(\w+)(\s+\1\b)+/gi, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.?!])/g, "$1")
    .trim();
}

/** BCP-47 tags for the speech recognizer; defaults to a regional variant where helpful. */
const SPEECH_LANGS: Record<string, string> = {
  ar: "ar-QA",
  ur: "ur-PK",
  fa: "fa-IR",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
  it: "it-IT",
  nl: "nl-NL",
  ru: "ru-RU",
  tr: "tr-TR",
  hi: "hi-IN",
  bn: "bn-IN",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  id: "id-ID",
  sw: "sw-KE",
};
export const speechLang = (lang: string) => SPEECH_LANGS[lang] ?? lang;
export const isRtlLang = (lang: string) => ["ar", "ur", "fa"].includes(lang);

type SpeechResultItem = { transcript: string; isFinal: boolean };
type VoiceResultEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: SpeechResultItem }>;
};
type VoiceErrorEvent = { error?: string };

type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: VoiceResultEvent) => void) | null;
  onerror: ((e: VoiceErrorEvent) => void) | null;
  onend: (() => void) | null;
};

const PRIVACY_NOTE =
  "Audio is processed by your browser's speech service and is not saved to our servers.";

export function VoiceButton({
  lang,
  onText,
  disabled,
  label = "Speak",
  iconOnly = false,
}: {
  lang: string;
  onText: (text: string) => void;
  disabled?: boolean;
  label?: string;
  iconOnly?: boolean;
}) {
  const [supported, setSupported] = useState(true);
  const [phase, setPhase] = useState<"idle" | "listening" | "processing">("idle");
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState("");
  const [interim, setInterim] = useState("");
  const [showUnsupported, setShowUnsupported] = useState(false);
  const recRef = useRef<Rec | null>(null);
  const silence = useRef<number | undefined>(undefined);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  // True while the user wants to keep listening; lets us restart on browsers that end sessions early (Safari, mobile).
  const wantRef = useRef(false);
  const restarts = useRef(0);

  useEffect(() => {
    const w = window as Window & {
      SpeechRecognition?: new () => Rec;
      webkitSpeechRecognition?: new () => Rec;
    };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => {
      window.clearTimeout(silence.current);
      recRef.current?.stop();
    };
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
    wantRef.current = false;
    window.clearTimeout(silence.current);
    recRef.current?.stop();
    setInterim("");
    setPhase("idle");
    setAnnouncement("Listening stopped");
  }
  // Only armed after speech is actually detected, so the mic never cuts off
  // before the user has started talking. 6s of silence ends the session.
  function armSilence() {
    window.clearTimeout(silence.current);
    silence.current = window.setTimeout(stop, 6000);
  }

  async function start() {
    setError("");
    setInterim("");
    const w = window as Window & {
      SpeechRecognition?: new () => Rec;
      webkitSpeechRecognition?: new () => Rec;
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    // Ask for the microphone first so the browser shows its permission prompt.
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch (err: unknown) {
        const name = err instanceof Error ? err.name : undefined;
        setError(
          name === "NotAllowedError" || name === "SecurityError"
            ? "Microphone access was blocked. Allow the microphone for this site in your browser settings (the icon next to the address bar), then try again."
            : name === "NotFoundError"
              ? "No microphone was found. Connect one and try again."
              : "The microphone couldn't be opened. Close other apps using it and try again.",
        );
        return;
      }
    }
    wantRef.current = true;
    restarts.current = 0;
    begin(SR);
  }

  function begin(SR: new () => Rec) {
    const rec: Rec = new SR();
    const ua = navigator.userAgent;
    // Safari and mobile browsers abort continuous sessions; use single-utterance mode and restart on end.
    const noContinuous =
      /iPhone|iPad|iPod|Android/i.test(ua) ||
      (/Safari/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua));
    rec.lang = speechLang(lang);
    rec.continuous = !noContinuous;
    rec.interimResults = true;
    rec.onresult = (e: VoiceResultEvent) => {
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
    rec.onerror = (e: VoiceErrorEvent) => {
      const kind = e.error;
      // "no-speech"/"aborted" during an auto-restart are normal on mobile; keep listening quietly.
      if ((kind === "no-speech" || kind === "aborted") && wantRef.current && restarts.current < 20)
        return;
      wantRef.current = false;
      setError(
        kind === "not-allowed" || kind === "service-not-allowed"
          ? "Microphone access was blocked. Allow it in your browser settings, then try again."
          : kind === "audio-capture"
            ? "No microphone was found. Connect one and try again."
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
    rec.onend = () => {
      if (wantRef.current && restarts.current < 20) {
        restarts.current++;
        try {
          begin(SR);
          return;
        } catch {
          /* fall through */
        }
      }
      wantRef.current = false;
      window.clearTimeout(silence.current);
      setInterim("");
      setPhase((p) => {
        if (p !== "idle") setAnnouncement("Listening stopped");
        return "idle";
      });
    };
    recRef.current = rec;
    // No silence timer here: it starts only once speech is detected.
    try {
      rec.start();
      setPhase("listening");
      if (!restarts.current) setAnnouncement("Listening started");
    } catch {
      wantRef.current = false;
      setPhase("idle");
      setError("Voice input could not start. Please try again.");
    }
  }

  const infoIcon = (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Voice input privacy information"
            className="min-h-11 min-w-11 text-muted-foreground"
          >
            <Info className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">{PRIVACY_NOTE}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (!supported) {
    return (
      <span className="relative inline-flex items-center gap-2">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                {iconOnly ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Voice input unavailable"
                    onClick={() => setShowUnsupported((v) => !v)}
                    className="size-10 rounded-full bg-background/95 opacity-60"
                  >
                    <Mic />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUnsupported((v) => !v)}
                    className="opacity-60"
                  >
                    <Mic />
                    {label}
                  </Button>
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">
              Voice input isn't available in this browser. Use Chrome, Edge or Safari — in Firefox
              it isn't supported, and Brave may block it (turn Shields off or enable speech
              services).
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {showUnsupported ? (
          <span
            role="status"
            className="absolute end-0 top-full z-20 mt-2 w-64 rounded-md border border-border bg-popover p-2 text-xs text-popover-foreground shadow-md"
          >
            Voice input isn't available in this browser. Use Chrome, Edge or Safari — in Firefox it
            isn't supported, and Brave may block it (turn Shields off or enable speech services).
          </span>
        ) : (
          <span className="sr-only">
            Voice input isn't available in this browser. Use Chrome, Edge or Safari — in Firefox it
            isn't supported, and Brave may block it (turn Shields off or enable speech services).
          </span>
        )}
        {infoIcon}
      </span>
    );
  }

  const listening = phase === "listening";
  const processing = phase === "processing";
  const active = phase !== "idle";

  if (iconOnly) {
    return (
      <span className="relative inline-flex items-center">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={active ? "default" : "outline"}
                size="icon"
                disabled={disabled}
                aria-label={
                  listening ? "Stop listening (Esc)" : processing ? "Processing speech…" : label
                }
                aria-pressed={active}
                onClick={active ? stop : start}
                className="relative size-10 rounded-full bg-background/95 shadow-sm"
              >
                {listening ? (
                  <MicOff />
                ) : processing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Mic />
                )}
                {listening && (
                  <span
                    aria-hidden="true"
                    className="absolute end-0 top-0 flex size-3 -translate-y-1/2 translate-x-1/2"
                  >
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex size-3 rounded-full border-2 border-background bg-destructive" />
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">
              {listening ? "Stop listening (Esc)" : processing ? "Processing speech…" : label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
        {error && (
          <span
            role="alert"
            className="absolute end-0 top-full z-20 mt-2 flex w-64 items-start gap-2 rounded-md border border-destructive/40 bg-popover p-2 text-start text-xs text-destructive shadow-md"
          >
            <span className="flex-1">{error}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setError("")}
              className="font-bold"
            >
              ×
            </button>
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={active ? "default" : "outline"}
        size="sm"
        disabled={disabled}
        aria-pressed={active}
        onClick={active ? stop : start}
      >
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
      {processing && (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Processing speech…
        </span>
      )}
      {interim && (
        <span
          role="status"
          aria-live="polite"
          className="max-w-48 truncate text-xs text-muted-foreground"
          title={interim}
        >
          {interim}
        </span>
      )}
      {infoIcon}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
