import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NEW_TOOLS } from "@/lib/tools/new-tool-catalog";
import { recognizeImage } from "@/lib/ocr";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50";
const fieldClass =
  "min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";
const areaClass = `${fieldClass} min-h-36`;
const STOPWORDS = new Set(
  "a an and are as at be been but by for from had has have he her hers him his i if in into is it its me my of on or our ours she so than that the their theirs them then there these they this to too up us was we were what when where which who will with you your".split(
    " ",
  ),
);
type Props = { slug: string };
function sentences(text: string) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ?? [];
}

function words(text: string) {
  return text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

function decodeSrtTime(time: string) {
  const match = time.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);
  if (!match) return null;
  return (
    Number(match[1]) * 3_600_000 +
    Number(match[2]) * 60_000 +
    Number(match[3]) * 1_000 +
    Number(match[4])
  );
}

function encodeSrtTime(ms: number) {
  const safe = Math.max(0, ms);
  const hours = Math.floor(safe / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1_000);
  const millis = safe % 1_000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

function contrastRatio(foreground: string, background: string) {
  const luminance = (hex: string) => {
    const match = hex.match(/^#?([0-9a-f]{6})$/i);
    if (!match) throw new Error("Enter valid six-digit hex colors.");
    const rgb = [0, 2, 4].map((index) => parseInt(match[1].slice(index, index + 2), 16) / 255);
    const [r, g, b] = rgb.map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function cronField(field: string, min: number, max: number) {
  const values = new Set<number>();
  for (const part of field.split(",")) {
    const [range, stepValue] = part.split("/");
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

async function requestJson(url: string) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`The public source returned HTTP ${response.status}.`);
  return (await response.json()) as unknown;
}

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2) ?? "null";
}

export function NewTool({ slug }: Props) {
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
        case "no-ai-summarizer": {
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
        case "regex-tester": {
          const expression = new RegExp(input, secondary || "g");
          const matches = [
            ...tertiary.matchAll(
              new RegExp(
                expression.source,
                expression.flags.includes("g") ? expression.flags : `${expression.flags}g`,
              ),
            ),
          ];
          setResult(
            <div>
              <p>
                {matches.length} match{matches.length === 1 ? "" : "es"} found. Flags:{" "}
                {expression.flags || "none"}.
              </p>
              <ul className="mt-2 list-disc ps-5">
                {matches.slice(0, 100).map((match, index) => (
                  <li key={`${match.index}-${index}`}>
                    <code>{match[0]}</code> at character {match.index}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm">
                Common patterns: <code>\\bword\\b</code> whole word · <code>\\d+</code> digits ·{" "}
                <code>^[A-Z]</code> starts with uppercase · <code>\\S+@\\S+</code> rough email
                check.
              </p>
            </div>,
          );
          break;
        }
        case "cron-explainer": {
          const fields = input.trim().split(/\s+/);
          if (fields.length !== 5)
            throw new Error(
              "Enter a standard five-field cron expression: minute hour day month weekday.",
            );
          const sets = [
            cronField(fields[0], 0, 59),
            cronField(fields[1], 0, 23),
            cronField(fields[2], 1, 31),
            cronField(fields[3], 1, 12),
            cronField(fields[4], 0, 7),
          ];
          const dates: Date[] = [];
          const cursor = new Date();
          cursor.setSeconds(0, 0);
          cursor.setMinutes(cursor.getMinutes() + 1);
          const dayOfMonthWildcard = fields[2] === "*";
          const dayOfWeekWildcard = fields[4] === "*";
          for (
            let step = 0;
            step < 527_040 && dates.length < 5;
            step++, cursor.setMinutes(cursor.getMinutes() + 1)
          ) {
            const weekday = cursor.getDay();
            const dayOfWeekMatch = sets[4].has(weekday) || (weekday === 0 && sets[4].has(7));
            const dateMatch =
              dayOfMonthWildcard && dayOfWeekWildcard
                ? true
                : dayOfMonthWildcard
                  ? dayOfWeekMatch
                  : dayOfWeekWildcard
                    ? sets[2].has(cursor.getDate())
                    : sets[2].has(cursor.getDate()) || dayOfWeekMatch;
            if (
              sets[0].has(cursor.getMinutes()) &&
              sets[1].has(cursor.getHours()) &&
              dateMatch &&
              sets[3].has(cursor.getMonth() + 1)
            )
              dates.push(new Date(cursor));
          }
          setResult(
            <div>
              <p>
                Fields: minute {fields[0]}, hour {fields[1]}, day of month {fields[2]}, month{" "}
                {fields[3]}, day of week {fields[4]}. This explains common numeric, range, list,
                wildcard, and step syntax; special extensions are not supported.
              </p>
              <List
                title="Next runs in your local time zone"
                items={dates.map((date) => date.toLocaleString())}
              />
            </div>,
          );
          break;
        }
        case "unit-converter": {
          const value = Number(input);
          if (!Number.isFinite(value)) throw new Error("Enter a number to convert.");
          const [category, from, to] = (secondary || "length|m|km").split("|");
          const factor: Record<string, number> = {
            "length|m": 1,
            "length|km": 1000,
            "length|cm": 0.01,
            "length|ft": 0.3048,
            "length|mi": 1609.344,
            "weight|kg": 1,
            "weight|g": 0.001,
            "weight|lb": 0.45359237,
            "weight|oz": 0.028349523,
            "data|B": 1,
            "data|KB": 1000,
            "data|MB": 1e6,
            "data|GB": 1e9,
            "data|KiB": 1024,
            "data|MiB": 1048576,
            "speed|m/s": 1,
            "speed|km/h": 1 / 3.6,
            "speed|mph": 0.44704,
          };
          const converted =
            category === "temperature"
              ? to === "°F"
                ? (value * 9) / 5 + 32
                : ((value - 32) * 5) / 9
              : (value * factor[`${category}|${from}`]) / factor[`${category}|${to}`];
          setTextResult(`${value} ${from} = ${Number(converted.toPrecision(10))} ${to}`);
          break;
        }
        case "color-contrast": {
          const ratio = contrastRatio(input, secondary);
          setTextResult(
            `Contrast ratio: ${ratio.toFixed(2)}:1\nWCAG AA normal text (4.5:1): ${ratio >= 4.5 ? "PASS" : "FAIL"}\nWCAG AA large text (3:1): ${ratio >= 3 ? "PASS" : "FAIL"}\nWCAG AAA normal text (7:1): ${ratio >= 7 ? "PASS" : "FAIL"}\nWCAG AAA large text (4.5:1): ${ratio >= 4.5 ? "PASS" : "FAIL"}`,
          );
          break;
        }
        case "image-compressor": {
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
        case "date-calculator": {
          const parseDate = (value: string) => {
            const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!match) return null;
            const date = new Date(
              Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
            );
            return date.getUTCFullYear() === Number(match[1]) &&
              date.getUTCMonth() === Number(match[2]) - 1 &&
              date.getUTCDate() === Number(match[3])
              ? date
              : null;
          };
          const first = parseDate(input);
          const second = parseDate(secondary);
          if (!first || !second) throw new Error("Choose two valid dates.");
          const start = new Date(Math.min(first.getTime(), second.getTime()));
          const end = new Date(Math.max(first.getTime(), second.getTime()));
          let weekdays = 0;
          const cursor = new Date(start);
          for (; cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
            if (cursor.getUTCDay() !== 0 && cursor.getUTCDay() !== 6) weekdays++;
          }
          const days = Math.round(Math.abs(first.getTime() - second.getTime()) / 86_400_000);
          setTextResult(
            `${days} calendar days apart\n${weekdays} weekdays inclusive\n${secondary} is the selected deadline`,
          );
          break;
        }
        case "encode-hash": {
          if (secondary === "URL encode") setTextResult(encodeURIComponent(input));
          else if (secondary === "URL decode") setTextResult(decodeURIComponent(input));
          else if (secondary === "Base64 encode") {
            const bytes = new TextEncoder().encode(input);
            let binary = "";
            for (let start = 0; start < bytes.length; start += 8192) {
              binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
            }
            setTextResult(btoa(binary));
          } else if (secondary === "Base64 decode")
            setTextResult(
              new TextDecoder().decode(
                Uint8Array.from(atob(input), (character) => character.charCodeAt(0)),
              ),
            );
          else {
            const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
            setTextResult(
              [...new Uint8Array(digest)]
                .map((byte) => byte.toString(16).padStart(2, "0"))
                .join(""),
            );
          }
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
        case "margin-of-error": {
          const size = Number(input);
          const proportion = Number(secondary) / 100;
          if (
            !secondary.trim() ||
            !Number.isFinite(size) ||
            size <= 0 ||
            !Number.isFinite(proportion) ||
            proportion < 0 ||
            proportion > 1
          )
            throw new Error("Enter a positive sample size and a proportion from 0 to 100.");
          const moe = 1.96 * Math.sqrt((proportion * (1 - proportion)) / size) * 100;
          setTextResult(
            `Approximate 95% margin of error: ±${moe.toFixed(2)} percentage points\nAssumes a simple random sample, no design effect, and a population large enough for the standard approximation.`,
          );
          break;
        }
        case "wikipedia-citations": {
          const page = (await requestJson(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(input.trim().replaceAll(" ", "_"))}`,
          )) as {
            title?: string;
            content_urls?: { desktop?: { page?: string } };
            timestamp?: string;
            extract?: string;
          };
          const url = page.content_urls?.desktop?.page;
          setResult(
            <div>
              <p>{page.extract}</p>
              <p className="mt-3 font-semibold">Basic APA-style citation</p>
              <p>
                {page.title}. (n.d.). <em>Wikipedia</em>. Retrieved{" "}
                {new Date().toLocaleDateString()}
                {url ? (
                  <>
                    {" "}
                    from{" "}
                    <a className="underline" href={url} target="_blank" rel="noreferrer">
                      {url}
                    </a>
                  </>
                ) : (
                  ""
                )}
              </p>
              <p className="mt-2 text-xs">
                Verify the page revision date and citation style requirements before using this
                reference.
              </p>
            </div>,
          );
          break;
        }
        case "wikidata-lookup": {
          const found = (await requestJson(
            `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(input)}&language=en&format=json&origin=*`,
          )) as { search?: { id: string; label: string; description?: string }[] };
          const matches = (found.search ?? []).slice(0, 5);
          if (!matches.length) {
            setResult(<p>No matching Wikidata entities were found.</p>);
            break;
          }
          const entitiesUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${matches.map((item) => item.id).join("|")}&props=labels|descriptions|claims&languages=en&format=json&origin=*`;
          const details = (await requestJson(entitiesUrl)) as {
            entities?: Record<
              string,
              {
                labels?: Record<string, { value?: string }>;
                descriptions?: Record<string, { value?: string }>;
                claims?: Record<string, { mainsnak?: { datavalue?: { value: unknown } } }[]>;
              }
            >;
          };
          const entities = details.entities ?? {};
          const claims = matches.flatMap((item) =>
            Object.entries(entities[item.id]?.claims ?? {})
              .slice(0, 8)
              .map(([property]) => property),
          );
          const uniqueClaims = [...new Set(claims)].slice(0, 40);
          const propertyLabels = uniqueClaims.length
            ? ((await requestJson(
                `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${uniqueClaims.join("|")}&props=labels&languages=en&format=json&origin=*`,
              )) as { entities?: Record<string, { labels?: Record<string, { value?: string }> }> })
            : { entities: {} };
          const facts = matches.map((item) => {
            const entity = entities[item.id];
            const statements = Object.entries(entity?.claims ?? {})
              .slice(0, 8)
              .map(([property, values]) => {
                const label = propertyLabels.entities?.[property]?.labels?.en?.value ?? property;
                const value = values[0]?.mainsnak?.datavalue?.value;
                const shown =
                  typeof value === "string" || typeof value === "number"
                    ? String(value)
                    : value &&
                        typeof value === "object" &&
                        "text" in value &&
                        typeof value.text === "string"
                      ? value.text
                      : value &&
                          typeof value === "object" &&
                          "id" in value &&
                          typeof value.id === "string"
                        ? value.id
                        : pretty(value);
                return `${label}: ${shown}`;
              });
            return `${entity?.labels?.en?.value ?? item.label} (${item.id}) — ${entity?.descriptions?.en?.value ?? item.description ?? "No description"}${statements.length ? `\n  ${statements.join("\n  ")}` : ""}`;
          });
          setTextResult(facts.join("\n\n"));
          break;
        }
        case "currency-converter": {
          const [from, to] = (secondary || "USD|EUR").split("|");
          const amount = Number(input);
          if (!Number.isFinite(amount)) throw new Error("Enter a numeric amount.");
          const data = (await requestJson(
            `https://api.frankfurter.app/latest?amount=${encodeURIComponent(String(amount))}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
          )) as { date?: string; rates?: Record<string, number> };
          setTextResult(
            `${amount} ${from} = ${data.rates?.[to]} ${to}\nECB reference date: ${data.date}\nRates are informational and may not match a live transaction.`,
          );
          break;
        }
        case "open-access-finder": {
          const doi = input.trim().replace(/^https?:\/\/doi\.org\//i, "");
          const encodedDoi = encodeURIComponent(doi);
          const [openAlex, unpaywall] = await Promise.all([
            requestJson(`https://api.openalex.org/works/https://doi.org/${encodedDoi}`) as Promise<{
              best_oa_location?: { landing_page_url?: string; pdf_url?: string };
              open_access?: { is_oa?: boolean };
            }>,
            requestJson(
              `https://api.unpaywall.org/v2/${encodedDoi}?email=hello@verfiai.app`,
            ) as Promise<{
              is_oa?: boolean;
              best_oa_location?: { landing_page_url?: string; url_for_pdf?: string };
              message?: string;
            }>,
          ]);
          const openUrl =
            unpaywall.best_oa_location?.url_for_pdf ??
            unpaywall.best_oa_location?.landing_page_url ??
            openAlex.best_oa_location?.pdf_url ??
            openAlex.best_oa_location?.landing_page_url;
          setResult(
            <div>
              <p>
                Open access reported:{" "}
                {unpaywall.is_oa || openAlex.open_access?.is_oa
                  ? "Yes"
                  : "No copy found by these services"}
                .
              </p>
              {openUrl && (
                <a
                  className="mt-2 inline-block underline"
                  href={openUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open the reported copy
                </a>
              )}
              <p className="mt-2 text-xs">
                A result is not legal advice. Check the repository and license terms.
              </p>
            </div>,
          );
          break;
        }
        case "scholar-search": {
          const key = `verfiai-openalex:${input.trim().toLowerCase()}`;
          const cached = sessionStorage.getItem(key);
          const data = cached
            ? (JSON.parse(cached) as {
                results?: {
                  title?: string;
                  publication_year?: number;
                  doi?: string;
                  authorships?: { author?: { display_name?: string } }[];
                }[];
              })
            : await requestJson(
                `https://api.openalex.org/works?search=${encodeURIComponent(input)}&per-page=10&select=title,publication_year,doi,authorships`,
              );
          if (!cached) sessionStorage.setItem(key, JSON.stringify(data));
          const items = (data.results ?? []).map(
            (work) =>
              `${work.title ?? "Untitled"} (${work.publication_year ?? "date unknown"}) — ${
                work.authorships
                  ?.slice(0, 3)
                  .map((author) => author.author?.display_name)
                  .filter(Boolean)
                  .join(", ") ?? "authors unavailable"
              }${work.doi ? ` — ${work.doi}` : ""}`,
          );
          setResult(<List title="OpenAlex scholarly works" items={items} />);
          break;
        }
        case "europepmc-reader": {
          const data = (await requestJson(
            `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(input)}&format=json&pageSize=10&resultType=core`,
          )) as {
            resultList?: {
              result?: {
                title?: string;
                authorString?: string;
                journalTitle?: string;
                pubYear?: string;
                pmcid?: string;
                doi?: string;
                abstractText?: string;
              }[];
            };
          };
          const works = data.resultList?.result ?? [];
          setResult(
            <ul className="space-y-4">
              {works.map((work) => (
                <li key={work.pmcid ?? work.doi ?? work.title}>
                  <p className="font-semibold">{work.title}</p>
                  <p className="text-sm">
                    {work.authorString} · {work.journalTitle} · {work.pubYear}
                  </p>
                  {work.abstractText && <p className="mt-1 text-sm">{work.abstractText}</p>}
                  {work.pmcid && (
                    <a
                      className="underline"
                      href={`https://europepmc.org/articles/${work.pmcid}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open full text on Europe PMC
                    </a>
                  )}
                </li>
              ))}
            </ul>,
          );
          break;
        }
        case "preprint-finder": {
          const since = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
          const today = new Date().toISOString().slice(0, 10);
          const servers = ["biorxiv", "medrxiv"];
          const collections = await Promise.all(
            servers.map(async (server) => {
              const data = (await requestJson(
                `https://api.biorxiv.org/details/${server}/${since}/${today}/0/json`,
              )) as {
                collection?: {
                  title?: string;
                  authors?: string;
                  date?: string;
                  doi?: string;
                  category?: string;
                }[];
              };
              return (data.collection ?? [])
                .filter((item) =>
                  `${item.title} ${item.authors} ${item.category}`
                    .toLowerCase()
                    .includes(input.toLowerCase()),
                )
                .map(
                  (item) =>
                    `${server}: ${item.title} (${item.date}) — ${item.authors} — https://doi.org/${item.doi}`,
                );
            }),
          );
          setResult(
            <List
              title="Recent matching preprints (last 7 days)"
              items={collections.flat().slice(0, 30)}
            />,
          );
          break;
        }
        case "gdelt-news": {
          const data = (await requestJson(
            `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(input)}&mode=ArtList&format=json&maxrecords=10&sort=datedesc`,
          )) as {
            articles?: { title?: string; url?: string; seendate?: string; domain?: string }[];
          };
          setResult(
            <ul className="space-y-3">
              {(data.articles ?? []).map((article) => (
                <li key={article.url}>
                  <a
                    className="font-semibold underline"
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {article.title}
                  </a>
                  <p className="text-xs">
                    {article.domain} · {article.seendate}
                  </p>
                </li>
              ))}
            </ul>,
          );
          break;
        }
        case "sec-filings": {
          const data = (await requestJson(
            `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(input)}&dateRange=all`,
          )) as { hits?: { hits?: { _source?: Record<string, unknown> }[] } };
          setTextResult(pretty(data.hits?.hits?.map((hit) => hit._source) ?? data));
          break;
        }
        case "world-bank-data": {
          const country = (input.trim() || "all").toUpperCase();
          const indicator = secondary.trim() || "NY.GDP.MKTP.CD";
          const data = (await requestJson(
            `https://api.worldbank.org/v2/country/${encodeURIComponent(country)}/indicator/${encodeURIComponent(indicator)}?format=json&per_page=20`,
          )) as [unknown, { country?: { value?: string }; date?: string; value?: number | null }[]];
          const rows = Array.isArray(data) ? (data[1] ?? []) : [];
          setResult(
            <List
              title={`World Bank indicator ${indicator}`}
              items={rows.map(
                (row) =>
                  `${row.country?.value ?? country}, ${row.date}: ${row.value ?? "no value"}`,
              )}
            />,
          );
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

  const launcherUrl = () => {
    const query = encodeURIComponent(input.trim());
    switch (slug) {
      case "factcheck-explorer":
        return `https://toolbox.google.com/factcheck/explorer/search/${query}`;
      case "connected-papers":
        return `https://www.connectedpapers.com/search?q=${query}`;
      case "google-scholar":
        return `https://scholar.google.com/scholar?q=${query}`;
      default:
        return "";
    }
  };

  const supportsText = !["image-compressor", "qr-scanner", "image-ocr"].includes(slug);
  const primaryLabel = isApi ? "Search public source" : "Run";

  return (
    <div className="space-y-4">
      {isLauncher ? (
        <Launcher slug={slug} query={input} setQuery={setInput} target={launcherUrl()} />
      ) : (
        <>
          {supportsText && (
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">{inputLabel(slug)}</span>
              <textarea
                className={areaClass}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={inputPlaceholder(slug)}
                aria-label={inputLabel(slug)}
              />
            </label>
          )}
          {slug === "word-frequency" && (
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={stopwords}
                onChange={(event) => setStopwords(event.target.checked)}
              />
              Exclude common stopwords
            </label>
          )}
          {slug === "regex-tester" && (
            <>
              <TextField
                label="Flags (for example g, i, or m)"
                value={secondary}
                setValue={setSecondary}
                placeholder="gi"
              />
              <TextField label="Test text" value={tertiary} setValue={setTertiary} multiline />
            </>
          )}
          {slug === "cron-explainer" && (
            <p className="text-xs text-muted-foreground">
              Use five fields: minute hour day-of-month month day-of-week. Numeric values, ranges,
              lists, wildcards, and steps are supported.
            </p>
          )}
          {slug === "unit-converter" && (
            <select
              className={fieldClass}
              value={secondary || "length|m|km"}
              onChange={(event) => setSecondary(event.target.value)}
              aria-label="Unit conversion"
            >
              <option value="length|m|km">Length: metres → kilometres</option>
              <option value="length|km|mi">Length: kilometres → miles</option>
              <option value="length|ft|m">Length: feet → metres</option>
              <option value="weight|kg|lb">Weight: kilograms → pounds</option>
              <option value="weight|lb|kg">Weight: pounds → kilograms</option>
              <option value="weight|g|oz">Weight: grams → ounces</option>
              <option value="temperature|°C|°F">Temperature: Celsius → Fahrenheit</option>
              <option value="temperature|°F|°C">Temperature: Fahrenheit → Celsius</option>
              <option value="data|MB|MiB">Data: megabytes → mebibytes</option>
              <option value="speed|km/h|mph">Speed: km/h → mph</option>
            </select>
          )}
          {slug === "color-contrast" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Foreground color"
                value={input}
                setValue={setInput}
                placeholder="#111111"
              />
              <TextField
                label="Background color"
                value={secondary}
                setValue={setSecondary}
                placeholder="#ffffff"
              />
            </div>
          )}
          {["image-compressor", "qr-scanner", "image-ocr"].includes(slug) && (
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Choose a local image</span>
              <input
                className="block min-h-11 w-full text-sm"
                type="file"
                accept="image/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
          )}
          {slug === "qr-scanner" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={buttonClass}
                  onClick={async () => {
                    try {
                      if (!navigator.mediaDevices?.getUserMedia)
                        throw new Error("Camera access is not available in this browser.");
                      cameraStream.current?.getTracks().forEach((track) => track.stop());
                      cameraStream.current = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: "environment" },
                      });
                      if (videoRef.current) videoRef.current.srcObject = cameraStream.current;
                      setCameraActive(true);
                      setFile(null);
                      setError("");
                    } catch (reason) {
                      showError(reason);
                    }
                  }}
                >
                  {cameraActive ? "Restart camera" : "Use camera"}
                </button>
                {cameraActive && (
                  <button
                    type="button"
                    className={`${buttonClass} bg-secondary text-secondary-foreground hover:bg-secondary/80`}
                    onClick={() => {
                      cameraStream.current?.getTracks().forEach((track) => track.stop());
                      cameraStream.current = null;
                      if (videoRef.current) videoRef.current.srcObject = null;
                      setCameraActive(false);
                    }}
                  >
                    Stop camera
                  </button>
                )}
              </div>
              {cameraActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="max-h-64 w-full rounded-md bg-black"
                  aria-label="Camera preview for QR scanning"
                />
              )}
            </div>
          )}
          {slug === "image-compressor" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Maximum width (pixels)"
                value={secondary}
                setValue={setSecondary}
                placeholder="1600"
              />
              <select
                className={fieldClass}
                value={tertiary || "image/jpeg"}
                onChange={(event) => setTertiary(event.target.value)}
                aria-label="Output image format"
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
                <option value="image/png">PNG</option>
              </select>
            </div>
          )}
          {slug === "image-ocr" && (
            <label className="block space-y-2">
              <span className="text-sm font-semibold">OCR language</span>
              <select
                className={fieldClass}
                value={lang}
                onChange={(event) => setLang(event.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </label>
          )}
          {slug === "date-calculator" && (
            <TextField label="Second date" value={secondary} setValue={setSecondary} type="date" />
          )}
          {slug === "encode-hash" && (
            <select
              className={fieldClass}
              value={secondary || "SHA-256"}
              onChange={(event) => setSecondary(event.target.value)}
              aria-label="Encoding operation"
            >
              <option>SHA-256</option>
              <option>Base64 encode</option>
              <option>Base64 decode</option>
              <option>URL encode</option>
              <option>URL decode</option>
            </select>
          )}
          {slug === "srt-shifter" && (
            <TextField
              label="Shift seconds (negative shifts earlier)"
              value={secondary}
              setValue={setSecondary}
              placeholder="1.5"
            />
          )}
          {slug === "margin-of-error" && (
            <TextField
              label="Sample proportion (percent)"
              value={secondary}
              setValue={setSecondary}
              placeholder="50"
            />
          )}
          {slug === "currency-converter" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className={fieldClass}
                value={secondary.split("|")[0] || "USD|EUR"}
                onChange={(event) =>
                  setSecondary(
                    `${event.target.value.split("|")[0]}|${secondary.split("|")[1] || "EUR"}`,
                  )
                }
                aria-label="Source currency"
              >
                {["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF"].map((currency) => (
                  <option key={currency} value={`${currency}|EUR`}>
                    {currency}
                  </option>
                ))}
              </select>
              <select
                className={fieldClass}
                value={secondary.split("|")[1] || "EUR"}
                onChange={(event) =>
                  setSecondary(`${secondary.split("|")[0] || "USD"}|${event.target.value}`)
                }
                aria-label="Target currency"
              >
                {["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF"].map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </div>
          )}
          {slug === "world-bank-data" && (
            <TextField
              label="Indicator code"
              value={secondary}
              setValue={setSecondary}
              placeholder="NY.GDP.MKTP.CD"
            />
          )}
          {slug === "open-access-finder" && (
            <p className="text-xs text-muted-foreground">
              Checks public OpenAlex and Unpaywall records. Unpaywall receives the site's public
              contact address, not your email. The request runs in your browser.
            </p>
          )}
          {slug === "scholar-search" && (
            <p className="text-xs text-muted-foreground">
              A matching query is cached only in session storage for this browser tab.
            </p>
          )}
          {isApi && (
            <p className="text-xs text-muted-foreground">
              This sends your query directly from your browser to the named public service. Verfiai
              does not proxy or store it; availability and rate limits are controlled by that
              service.
            </p>
          )}
          <button
            type="button"
            className={buttonClass}
            onClick={() => void run()}
            disabled={busy || (supportsText && !input.trim())}
          >
            {busy ? "Working…" : primaryLabel}
          </button>
        </>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {result && (
        <div
          aria-live="polite"
          className="rounded-md border border-border bg-card p-4 text-sm leading-6"
        >
          {result}
        </div>
      )}
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-2 list-disc space-y-1 ps-5">
          {items.map((item, index) => (
            <li key={`${index}-${item}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2">No results.</p>
      )}
    </section>
  );
}

function TextField({
  label,
  value,
  setValue,
  placeholder,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}) {
  const field = multiline ? (
    <textarea
      className={areaClass}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
    />
  ) : (
    <input
      className={fieldClass}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      type={type}
    />
  );
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {field}
    </label>
  );
}

function inputLabel(slug: string) {
  if (slug === "unit-converter") return "Value to convert";
  if (slug === "color-contrast") return "Foreground color";
  if (slug === "date-calculator") return "First date";
  if (slug === "margin-of-error") return "Sample size";
  if (slug === "currency-converter") return "Amount";
  if (slug === "open-access-finder") return "DOI";
  if (slug === "world-bank-data") return "Country code (or all)";
  const labels: Record<string, string> = {
    "cron-explainer": "Five-field cron expression",
    "regex-tester": "Regular expression",
    "srt-shifter": "Paste SRT subtitle text",
    "wikipedia-citations": "Wikipedia article title",
    "wikidata-lookup": "Entity to look up",
    "scholar-search": "Paper title, author, or topic",
    "europepmc-reader": "Biomedical search",
    "preprint-finder": "Search recent preprints",
    "gdelt-news": "News search query",
    "sec-filings": "Filing text search",
  };
  return labels[slug] ?? "Text to analyze";
}

function inputPlaceholder(slug: string) {
  if (slug === "cron-explainer") return "*/15 9-17 * * 1-5";
  if (slug === "date-calculator") return "";
  if (slug === "margin-of-error") return "1000";
  if (slug === "currency-converter") return "100";
  if (slug === "world-bank-data") return "US";
  return "Enter or paste here…";
}

function Launcher({
  slug,
  query,
  setQuery,
  target,
}: {
  slug: string;
  query: string;
  setQuery: (value: string) => void;
  target: string;
}) {
  const [opened, setOpened] = useState(false);
  const descriptions: Record<string, string> = {
    "factcheck-explorer":
      "Google Fact Check Explorer searches claim-checking articles from publishers. It does not evaluate a claim itself, and coverage is incomplete.",
    "video-verify":
      "InVID-WeVerify offers keyframe extraction and contextual verification aids. It does not certify that a video is authentic.",
    "image-forensics":
      "FotoForensics and Forensically provide visual inspection aids such as error-level analysis. Compression, editing, and image content can produce misleading patterns.",
    "connected-papers":
      "Connected Papers visualizes relationships between scholarly works. Graphs are discovery aids, not an assessment of paper quality.",
    "google-scholar":
      "Google Scholar searches scholarly records. Index coverage, versions, and citation counts can be incomplete or duplicated.",
  };
  if (slug === "video-verify" || slug === "image-forensics") {
    return (
      <div className="space-y-4">
        <p>{descriptions[slug]}</p>
        <p className="text-sm">
          This opens an external free tool. No content is sent through or stored by Verfiai.
        </p>
        <div className="flex flex-wrap gap-3">
          {(slug === "video-verify"
            ? [
                [
                  "Open InVID-WeVerify",
                  "https://www.invid-project.eu/tools-and-services/invid-verification-plugin/",
                ],
              ]
            : [
                ["Open FotoForensics", "https://fotoforensics.com/"],
                ["Open Forensically", "https://29a.ch/photo-forensics/"],
              ]
          ).map(([label, url]) => (
            <a key={url} className={buttonClass} href={url} target="_blank" rel="noreferrer">
              {label}
            </a>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <p>{descriptions[slug]}</p>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">
          {slug === "factcheck-explorer" ? "Claim" : "Paper title or author query"}
        </span>
        <input
          className={fieldClass}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <p className="text-sm">
        This opens an external free tool. Nothing is proxied or stored by Verfiai.
      </p>
      <a
        className={buttonClass}
        href={target}
        target="_blank"
        rel="noreferrer"
        onClick={() => setOpened(true)}
      >
        {opened ? "Open search again" : "Open external free tool"}
      </a>
    </div>
  );
}
