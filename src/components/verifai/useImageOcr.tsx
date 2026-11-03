import { useState, type ClipboardEvent, type DragEvent } from "react";
import { ImageUp, LoaderCircle } from "lucide-react";
import { isOcrImage, recognizeImage } from "@/lib/ocr";

/** Adds screenshot paste + image drag-and-drop OCR to any text input. Runs fully in the browser. */
export function useImageOcr(lang: string, onText: (text: string) => void) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  async function run(file: File) {
    setError("");
    setProgress(0);
    try {
      const text = await recognizeImage(file, lang, setProgress);
      if (!text) setError("No readable text was found in that image.");
      else onText(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that image.");
    } finally {
      setProgress(null);
    }
  }
  const pick = (files?: FileList | null) => Array.from(files ?? []).find(isOcrImage);
  const handlers = {
    onPaste: (e: ClipboardEvent) => {
      const f = pick(e.clipboardData?.files);
      if (f) {
        e.preventDefault();
        void run(f);
      }
    },
    onDragOver: (e: DragEvent) => {
      if (Array.from(e.dataTransfer.items).some((i) => i.type.startsWith("image/"))) {
        e.preventDefault();
        setOver(true);
      }
    },
    onDragLeave: () => setOver(false),
    onDrop: (e: DragEvent) => {
      setOver(false);
      const f = pick(e.dataTransfer.files);
      if (f) {
        e.preventDefault();
        void run(f);
      }
    },
  };
  const status = (
    <div aria-live="polite" className="mt-2 min-h-5 text-xs text-muted-foreground">
      {progress !== null ? (
        <span className="inline-flex items-center gap-1.5">
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
          Reading text from image on your device… {Math.round(progress * 100)}%
        </span>
      ) : error ? (
        <span role="alert" className="text-destructive">
          {error}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <ImageUp className="size-3.5" aria-hidden />
          Paste a screenshot or drop an image to extract its text. Images stay on your device.
        </span>
      )}
    </div>
  );
  return { handlers, status, over, busy: progress !== null, run };
}
