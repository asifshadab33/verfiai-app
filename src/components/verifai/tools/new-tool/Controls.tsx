import { useState, type ReactNode, type RefObject } from "react";
import type { Lang } from "@/lib/translations";
import type { FreeSourceResult } from "@/lib/free-source.functions";
import type { NewToolDefinition } from "@/lib/tools/new-tool-catalog";
import { siteText } from "@/lib/site-i18n";
import { buttonClass, fieldClass, areaClass } from "./shared";
type State = { slug:string; locale:Lang; definition:NewToolDefinition; input:string; setInput:(v:string)=>void; secondary:string; setSecondary:(v:string)=>void; tertiary:string; setTertiary:(v:string)=>void; result:ReactNode; error:string; busy:boolean; stopwords:boolean; setStopwords:(v:boolean)=>void; file:File|null; setFile:(v:File|null)=>void; lang:string; setLang:(v:string)=>void; cameraActive:boolean; setCameraActive:(v:boolean)=>void; videoRef:RefObject<HTMLVideoElement|null>; cameraStream:RefObject<MediaStream|null>; showError:(e:unknown)=>void; run:()=>Promise<void>; isLauncher:boolean; isApi:boolean };
export function Controls({slug, locale, definition, input, setInput, secondary, setSecondary, tertiary, setTertiary, result, error, busy, stopwords, setStopwords, file, setFile, lang, setLang, cameraActive, setCameraActive, videoRef, cameraStream, showError, run, isLauncher, isApi}:State) {
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
              contact address, not your email. {siteText(locale, "openAccessCacheNote")}
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
          {definition.kind === "server" && (
            <p className="text-xs text-muted-foreground">
              {siteText(locale, "freeToolServerFetch")}
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

export function SourceResults({ results }: { results: FreeSourceResult[] }) {
  return results.length ? (
    <ul className="space-y-3">
      {results.map((item) => (
        <li key={item.url}>
          <a className="font-semibold underline" href={item.url} target="_blank" rel="noreferrer">
            {item.title}
          </a>
          {(item.detail || item.date) && (
            <p className="text-xs">
              {[item.detail, item.date].filter(Boolean).join(" · ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p>No results.</p>
  );
}

export function List({ title, items }: { title: string; items: string[] }) {
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
  if (slug === "color-contrast") return "Foreground color";
  if (slug === "date-calculator") return "First date";
  if (slug === "margin-of-error") return "Sample size";
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
