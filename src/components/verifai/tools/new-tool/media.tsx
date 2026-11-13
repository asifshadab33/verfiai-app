import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NEW_TOOLS } from "@/lib/tools/new-tool-catalog";
import { STOPWORDS, sentences, words, decodeSrtTime, encodeSrtTime, contrastRatio, cronField, requestJson, requestOptionalJson, pretty, type Props } from "./shared";
import { Controls, List, SourceResults } from "./Controls";
import { recognizeImage } from "@/lib/ocr";
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
      switch (slug) {        case "image-compressor": {
          if (!file) throw new Error("Choose an image first.");
          if (file.size > 40 * 1024 * 1024) throw new Error("Choose an image smaller than 40 MB.");
          const image = await createImageBitmap(file);
          const maxWidth = Math.max(1, Number(secondary) || image.width);
          const scale = Math.min(1, maxWidth / image.width);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("This browser could not create an image canvas.");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          image.close();
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, tertiary || "image/jpeg", 0.82),
          );
          if (!blob) throw new Error("This image format could not be encoded by your browser.");
          const url = URL.createObjectURL(blob);
          downloadUrl.current = url;
          setResult(
            <div>
              <p>
                {canvas.width} × {canvas.height}; {Math.round(file.size / 1024)} KB →{" "}
                {Math.round(blob.size / 1024)} KB.
              </p>
              <a
                className="underline"
                href={url}
                download={`compressed.${blob.type.split("/")[1] || "jpg"}`}
              >
                Download compressed image
              </a>
            </div>,
          );
          break;
        }
        case "qr-scanner": {
          if (file && file.size > 40 * 1024 * 1024)
            throw new Error("Choose an image smaller than 40 MB.");
          const source = file ?? videoRef.current;
          if (!source) throw new Error("Choose an image or start the camera before scanning.");
          const bitmap = await createImageBitmap(source);
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (!context) throw new Error("This browser could not read image pixels.");
          context.drawImage(bitmap, 0, 0);
          bitmap.close();
          const { default: decodeQr } = await import("jsqr");
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = decodeQr(pixels.data, pixels.width, pixels.height);
          setTextResult(code?.data ?? "No QR code was found in the selected image.");
          break;
        }
        case "image-ocr": {
          if (!file) throw new Error("Choose an image first.");
          setTextResult((await recognizeImage(file, lang)) || "No readable text was found.");
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
