import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseExif, type ExifGroup, type ExifResult } from "@/lib/tools/exif";
import {
  normalizeImageUrl,
  reverseSearchLinks,
  UPLOAD_SEARCH_PAGES,
  type SearchLink,
} from "@/lib/tools/image-search";

const MAX_BYTES = 40 * 1024 * 1024;
const GROUPS: ExifGroup[] = ["Camera", "Date", "Settings", "Image", "Author", "Location"];

export function PhotoCheck() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ExifResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [links, setLinks] = useState<SearchLink[] | null>(null);
  const [urlError, setUrlError] = useState("");
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  async function open(f: File) {
    setError("");
    setResult(null);
    if (!f.type.startsWith("image/")) return setError("Choose an image file.");
    if (f.size > MAX_BYTES) return setError("That file is larger than 40 MB.");
    setBusy(true);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    try {
      setResult(parseExif(await f.arrayBuffer()));
    } catch {
      setError("This file could not be read.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadClean() {
    if (!file || !preview) return;
    try {
      const img = new Image();
      img.src = preview;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")?.drawImage(img, 0, 0);
      const png = file.type === "image/png";
      c.toBlob(
        (b) => {
          if (!b) return setError("Could not create a clean copy.");
          const a = document.createElement("a");
          a.href = URL.createObjectURL(b);
          a.download = `${file.name.replace(/\.[^.]+$/, "")}-no-metadata.${png ? "png" : "jpg"}`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        },
        png ? "image/png" : "image/jpeg",
        0.92,
      );
    } catch {
      setError("This browser could not re-save that image.");
    }
  }

  function makeLinks() {
    const r = normalizeImageUrl(imgUrl);
    if (!r.ok) {
      setLinks(null);
      return setUrlError(r.error);
    }
    setUrlError("");
    setLinks(reverseSearchLinks(r.url));
  }

  return (
    <div className="space-y-8">
      <section
        aria-label="Photo metadata"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8"
      >
        <h2 className="font-display text-2xl font-bold">1. See a photo&rsquo;s metadata</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a photo from your device. It is read in your browser and never uploaded.
        </p>
        <input
          ref={inputRef}
          id="pc-file"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void open(f);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          Choose a photo
        </Button>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {file && result && (
          <div className="mt-6 grid gap-6 md:grid-cols-[12rem_1fr]">
            {preview && (
              <img
                src={preview}
                alt="Preview of the chosen photo"
                className="max-h-48 w-full rounded-xl border border-border object-contain md:w-48"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm [overflow-wrap:anywhere]">
                <strong>{file.name}</strong> · {(file.size / 1024).toFixed(0)} KB ·{" "}
                {file.type || "unknown type"}
              </p>
              {result.status !== "ok" && (
                <p role="status" className="mt-3 rounded-xl bg-secondary p-3 text-sm">
                  {result.notes[0]}
                </p>
              )}
              {GROUPS.map((g) => {
                const rows = result.fields.filter((f) => f.group === g);
                return rows.length ? (
                  <div key={g} className="mt-4">
                    <h3 className="text-sm font-semibold">{g}</h3>
                    <dl className="mt-1 divide-y divide-border rounded-xl border border-border text-sm">
                      {rows.map((f) => (
                        <div key={f.label} className="grid gap-1 p-2 sm:grid-cols-[11rem_1fr]">
                          <dt className="text-muted-foreground">{f.label}</dt>
                          <dd className="[overflow-wrap:anywhere]">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null;
              })}
              {result.gps && (
                <p className="mt-3">
                  <a
                    href={result.gps.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline"
                  >
                    <MapPin className="size-4" aria-hidden="true" />
                    Open this location on OpenStreetMap
                  </a>
                </p>
              )}
              {result.status === "ok" && result.notes.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm">
                  {result.notes.map((n) => (
                    <li key={n} className="rounded-xl border border-border bg-background p-3">
                      {n}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <Button type="button" variant="outline" size="sm" onClick={downloadClean}>
                  <Download className="size-4" />
                  Download a copy without metadata
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  This re-saves the image, which can slightly reduce JPEG quality.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section
        aria-label="Reverse image search"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8"
      >
        <h2 className="font-display text-2xl font-bold">
          2. Search for where else a picture appears
        </h2>
        <label htmlFor="pc-url" className="mt-3 block text-sm font-semibold">
          Image web address
        </label>
        <div className="mt-2 flex flex-wrap gap-3">
          <Input
            id="pc-url"
            type="url"
            dir="ltr"
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="min-w-0 flex-1 bg-background"
          />
          <Button type="button" onClick={makeLinks} disabled={!imgUrl.trim()}>
            Create search links
          </Button>
        </div>
        {urlError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {urlError}
          </p>
        )}
        {links && (
          <div className="mt-4">
            <ul className="flex flex-wrap gap-3">
              {links.map((l) => (
                <li key={l.id}>
                  <Button asChild variant="outline">
                    <a href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label}
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Each link opens that search engine in a new tab and sends it the image address you
              entered.
            </p>
          </div>
        )}
        <div className="mt-6 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">Have a file instead?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Open an engine and upload the file there. We do not upload it for you.
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {UPLOAD_SEARCH_PAGES.map((l) => (
              <li key={l.id}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
