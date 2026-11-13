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
      switch (slug) {
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
