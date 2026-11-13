import type { Lang } from "@/lib/translations";
export const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50";
export const fieldClass =
  "min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";
export const areaClass = `${fieldClass} min-h-36`;
export const STOPWORDS = new Set(
  "a an and are as at be been but by for from had has have he her hers him his i if in into is it its me my of on or our ours she so than that the their theirs them then there these they this to too up us was we were what when where which who will with you your".split(
    " ",
  ),
);
export type Props = { slug: string; locale?: Lang };
export function sentences(text: string) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ?? [];
}

export function words(text: string) {
  return text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function decodeSrtTime(time: string) {
  const match = time.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);
  if (!match) return null;
  return (
    Number(match[1]) * 3_600_000 +
    Number(match[2]) * 60_000 +
    Number(match[3]) * 1_000 +
    Number(match[4])
  );
}

export function encodeSrtTime(ms: number) {
  const safe = Math.max(0, ms);
  const hours = Math.floor(safe / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1_000);
  const millis = safe % 1_000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

export function contrastRatio(foreground: string, background: string) {
  const luminance = (hex: string) => {
    const match = hex.match(/^#?([0-9a-f]{6})$/i);
    if (!match) throw new Error("Enter valid six-digit hex colors.");
    const rgb = [0, 2, 4].map((index) => parseInt((match[1] ?? "").slice(index, index + 2), 16) / 255);
    const [r = 0, g = 0, b = 0] = rgb.map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function cronField(field: string, min: number, max: number) {
  const values = new Set<number>();
  for (const part of field.split(",")) {
    const [range = "", stepValue] = part.split("/");
    const step = stepValue ? Number(stepValue) : 1;
    if (!Number.isInteger(step) || step < 1)
      throw new Error("Cron step values must be positive integers.");
    const [startValue, endValue] = range === "*" ? [min, max] : range.split("-").map(Number);
    const start = startValue ?? Number(range);
    const end = endValue ?? start;
    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < min ||
      end > max ||
      start > end
    ) {
      throw new Error(`Cron field values must be between ${min} and ${max}.`);
    }
    for (let value = start; value <= end; value += step) values.add(value);
  }
  return values;
}

export async function requestJson(url: string) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`The public source returned HTTP ${response.status}.`);
  return (await response.json()) as unknown;
}

export async function requestOptionalJson(url: string) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (response.status === 404) return {};
  if (!response.ok) throw new Error(`The public source returned HTTP ${response.status}.`);
  return (await response.json()) as unknown;
}

export function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2) ?? "null";
}

