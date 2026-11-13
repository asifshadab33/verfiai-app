import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NEW_TOOLS } from "@/lib/tools/new-tool-catalog";
import { STOPWORDS, sentences, words, decodeSrtTime, encodeSrtTime, contrastRatio, cronField, requestJson, requestOptionalJson, pretty, type Props } from "./shared";
import { Controls, List, SourceResults } from "./Controls";
import { runRegexInWorker } from "@/lib/regex-tester";
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
      switch (slug) {        case "regex-tester": {
          const matches = await runRegexInWorker(input, tertiary, secondary || "g");
          const expressionFlags = secondary || "g";
          setResult(
            <div>
              <p>
                {matches.length} match{matches.length === 1 ? "" : "es"} found. Flags:{" "}
                {expressionFlags || "none"}.
              </p>
              <ul className="mt-2 list-disc ps-5">
                {matches.slice(0, 100).map((match, index) => (
                  <li key={`${match.index}-${index}`}>
                    <code>{match.value}</code> at character {match.index}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm">
                Common patterns: <code>\\\\bword\\\\b</code> whole word · <code>\\\\d+</code> digits ·{" "}
                <code>^[A-Z]</code> starts with uppercase · <code>\\\\S+@\\\\S+</code> rough email
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
            cronField(fields[0] ?? "", 0, 59),
            cronField(fields[1] ?? "", 0, 23),
            cronField(fields[2] ?? "", 1, 31),
            cronField(fields[3] ?? "", 1, 12),
            cronField(fields[4] ?? "", 0, 7),
          ] as const;
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
        case "color-contrast": {
          const ratio = contrastRatio(input, secondary);
          setTextResult(
            `Contrast ratio: ${ratio.toFixed(2)}:1\nWCAG AA normal text (4.5:1): ${ratio >= 4.5 ? "PASS" : "FAIL"}\nWCAG AA large text (3:1): ${ratio >= 3 ? "PASS" : "FAIL"}\nWCAG AAA normal text (7:1): ${ratio >= 7 ? "PASS" : "FAIL"}\nWCAG AAA large text (4.5:1): ${ratio >= 4.5 ? "PASS" : "FAIL"}`,
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
