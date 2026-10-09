// Day 8: zero-cost OCR that runs entirely in the browser with Tesseract.js.
// Images never leave the device; only the extracted text is placed in the input.
const TESS_LANG: Record<string, string> = {
  en: "eng", es: "spa", fr: "fra", de: "deu", pt: "por", it: "ita", nl: "nld", ru: "rus", tr: "tur",
  ar: "ara", hi: "hin", bn: "ben", ur: "urd", fa: "fas", zh: "chi_sim", ja: "jpn", ko: "kor", id: "ind", sw: "swa",
};
export const ocrLanguages = (lang: string) => (lang === "en" ? "eng" : `${TESS_LANG[lang] ?? "eng"}+eng`);
export const OCR_MAX_BYTES = 8 * 1024 * 1024;
export const isOcrImage = (f: File) => /^image\/(png|jpe?g|webp|bmp|gif)$/i.test(f.type);

export async function recognizeImage(file: File, lang: string, onProgress?: (p: number) => void): Promise<string> {
  if (!isOcrImage(file)) throw new Error("Please use a PNG, JPG, WebP, BMP or GIF image.");
  if (file.size > OCR_MAX_BYTES) throw new Error("That image is larger than 8 MB.");
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(ocrLanguages(lang), 1, { logger: m => { if (m.status === "recognizing text") onProgress?.(m.progress); } });
  try {
    const { data } = await worker.recognize(file);
    return data.text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  } finally { await worker.terminate(); }
}
