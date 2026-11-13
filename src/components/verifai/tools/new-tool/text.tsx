import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NEW_TOOLS } from "@/lib/tools/new-tool-catalog";
import { STOPWORDS, sentences, words, decodeSrtTime, encodeSrtTime, contrastRatio, cronField, requestJson, requestOptionalJson, pretty, type Props } from "./shared";
import { Controls, List, SourceResults } from "./Controls";
export default function CategoryTool({ slug, locale = "en" }: Props) {
  const definition = NEW_TOOLS.find((tool) => tool.slug === slug);
  const [input, setInput] = useState("");
  const [secondary, setSecondary] = useState("");
  const [tertiary, setTertiary] = useState("");
  const [result, setResult] = useState<ReactNode>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stopwords, setStopwords] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState("en");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStream = useRef<MediaStream | null>(null);
  const downloadUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      cameraStream.current?.getTracks().forEach((track) => track.stop());
      cameraStream.current = null;
      if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
    };
  }, []);

  useEffect(() => {
    if (cameraActive && videoRef.current && cameraStream.current) {
      videoRef.current.srcObject = cameraStream.current;
    }
  }, [cameraActive]);

  const isLauncher = definition?.kind === "launcher";
  const isApi = definition?.kind === "api";
  const wordCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const word of words(input)) {
      if (!stopwords || !STOPWORDS.has(word)) counts.set(word, (counts.get(word) ?? 0) + 1);
    }
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 30);
  }, [input, stopwords]);

  if (!definition) return <p role="alert">This free tool could not be found.</p>;

  const showError = (reason: unknown) =>
    setError(reason instanceof Error ? reason.message : "The operation could not be completed.");
  const setTextResult = (text: string) =>
    setResult(<pre className="whitespace-pre-wrap break-words">{text}</pre>);

  async function run() {
    setResult(null);
    setError("");
    if (downloadUrl.current) {
      URL.revokeObjectURL(downloadUrl.current);
      downloadUrl.current = null;
    }
    setBusy(true);
    try {
      switch (slug) {        case "no-ai-summarizer": {
          const all = sentences(input);
          if (!all.length) throw new Error("Paste text to summarize.");
          const frequency = new Map<string, number>();
          for (const word of words(input)) {
            if (!STOPWORDS.has(word)) frequency.set(word, (frequency.get(word) ?? 0) + 1);
          }
          const scored = all.map((sentence, index) => {
            const terms = words(sentence).filter((word) => !STOPWORDS.has(word));
            const score =
              terms.reduce((sum, word) => sum + (frequency.get(word) ?? 0), 0) /
              Math.max(terms.length, 1);
            return { sentence, index, score };
          });
          const count = Math.max(1, Math.ceil(all.length * 0.25));
          const selected = new Set(
            [...scored]
              .sort((a, b) => b.score - a.score)
              .slice(0, count)
              .map((item) => item.index),
          );
          setResult(
            <div className="space-y-2">
              <p>
                This extractive summary uses word-frequency scoring; no AI is used. Selected
                sentences are shown in original order:
              </p>
              <ol className="list-decimal space-y-2 ps-5">
                {all.map(
                  (sentence, index) =>
                    selected.has(index) && <li key={`${index}-${sentence}`}>{sentence}</li>,
                )}
              </ol>
            </div>,
          );
          break;
        }
        case "word-frequency": {
          const ngrams = new Map<string, number>();
          const tokens = words(input);
          for (const size of [2, 3]) {
            for (let index = 0; index <= tokens.length - size; index++) {
              const phraseWords = tokens.slice(index, index + size);
              if (stopwords && phraseWords.some((word) => STOPWORDS.has(word))) continue;
              const phrase = phraseWords.join(" ");
              ngrams.set(phrase, (ngrams.get(phrase) ?? 0) + 1);
            }
          }
          setResult(
            <div className="grid gap-6 sm:grid-cols-2">
              <List
                title="Top words"
                items={wordCounts.map(([word, count]) => `${word} — ${count}`)}
              />
              <List
                title="Top two- and three-word phrases"
                items={[...ngrams]
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 20)
                  .map(([phrase, count]) => `${phrase} — ${count}`)}
              />
            </div>,
          );
          break;
        }
        case "acronym-extractor": {
          const matches = [
            ...input.matchAll(/\b[A-Z][A-Z0-9&.-]{1,}(?:\s+[A-Z][A-Z0-9&.-]{1,})*\b/g),
          ];
          setResult(
            <List
              title={`${matches.length} likely acronyms`}
              items={matches.map((match) => {
                const start = Math.max(0, (match.index ?? 0) - 60);
                const end = Math.min(input.length, (match.index ?? 0) + match[0].length + 60);
                return `${match[0]} — “…${input.slice(start, end).replace(/\s+/g, " ")}…”`;
              })}
            />,
          );
          break;
        }
        case "srt-shifter": {
          const offset = Number(secondary) * 1000;
          if (!Number.isFinite(offset))
            throw new Error(
              "Enter the timing shift in seconds (negative values move subtitles earlier).",
            );
          let changed = 0;
          const shifted = input.replace(
            /(\d{2}:\d{2}:\d{2})[,.](\d{1,3})\s*-->\s*(\d{2}:\d{2}:\d{2})[,.](\d{1,3})/g,
            (
              line,
              startClock: string,
              startFraction: string,
              endClock: string,
              endFraction: string,
            ) => {
              const startMs = decodeSrtTime(`${startClock},${startFraction.padEnd(3, "0")}`);
              const endMs = decodeSrtTime(`${endClock},${endFraction.padEnd(3, "0")}`);
              if (startMs === null || endMs === null) return line;
              changed++;
              return `${encodeSrtTime(startMs + offset)} --> ${encodeSrtTime(endMs + offset)}`;
            },
          );
          if (!changed) throw new Error("No valid SRT timing lines were found.");
          setTextResult(shifted);
          break;
        }

        default:
          break;
      }
    } catch (reason) {
      showError(reason);
    } finally {
      setBusy(false);
    }
  }

  return <Controls slug={slug} locale={locale} definition={definition} input={input} setInput={setInput} secondary={secondary} setSecondary={setSecondary} tertiary={tertiary} setTertiary={setTertiary} result={result} error={error} busy={busy} stopwords={stopwords} setStopwords={setStopwords} file={file} setFile={setFile} lang={lang} setLang={setLang} cameraActive={cameraActive} setCameraActive={setCameraActive} videoRef={videoRef} cameraStream={cameraStream} showError={showError} run={run} isLauncher={isLauncher} isApi={isApi} />;
}
