import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ArrowRight, AudioLines, ChevronRight, CircleAlert, FileImage, FileText, Fingerprint, Link2, LockKeyhole, ScanFace, Shield, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import forensicImage from "@/assets/cyber-forensics.jpg";

const title = "Cybersecurity Concept | VERFI AI";
const description = "Explore a VERFI AI cybersecurity concept for media authenticity, document forensics and digital-risk workflows. This is a design preview, not a live scanning service.";

export const Route = createFileRoute("/cybersecurity-concept")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: CybersecurityConcept,
});

type Example = "portrait" | "invoice" | "audio";
const exampleInfo: Record<Example, { title: string; kind: string; Icon: typeof ScanFace }> = {
  portrait: { title: "AI portrait example", kind: "Illustrative media scenario", Icon: ScanFace },
  invoice: { title: "Fabricated invoice example", kind: "Illustrative document scenario", Icon: FileText },
  audio: { title: "Synthetic audio example", kind: "Illustrative audio scenario", Icon: AudioLines },
};
const acceptedTypes = ["video/mp4", "image/jpeg", "image/png"];
const maxBytes = 20 * 1024 * 1024;

function PreviewZone() {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [example, setExample] = useState<Example | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file || !["image/jpeg", "image/png", "video/mp4"].includes(file.type)) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function acceptFile(candidate?: File) {
    if (!candidate) return;
    if (!acceptedTypes.includes(candidate.type) || candidate.size > maxBytes) {
      setError("Choose an MP4, JPG or PNG file under 20 MB.");
      return;
    }
    setFile(candidate);
    setExample(null);
    setError("");
  }
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0]);
    event.target.value = "";
  }
  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }
  function reset() { setFile(null); setImageUrl(null); setExample(null); setError(""); }

  return <div className="relative w-full border border-border bg-card/95 p-4 shadow-2xl sm:p-5" aria-label="Media preview panel">
    <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4 text-xs font-semibold uppercase text-muted-foreground">
      <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" /> Media inspection / concept</span>
      <span className="hidden sm:block">01 — 03</span>
    </div>
    <input ref={input} type="file" className="sr-only" accept=".mp4,.jpg,.jpeg,.png,video/mp4,image/jpeg,image/png" onChange={onChange} aria-label="Choose a media file" />
    <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={e => { e.preventDefault(); setDragging(false); }} onDrop={onDrop} className={`relative flex min-h-56 flex-col items-center justify-center overflow-hidden border border-dashed px-5 py-6 text-center transition-colors sm:min-h-64 ${dragging ? "border-primary bg-accent" : "border-input bg-background"}`}>
      {file && imageUrl ? <div className="flex w-full flex-col items-center gap-2">
        {file.type.startsWith("image/") ? <img src={imageUrl} alt="Local file preview" className="max-h-36 max-w-full object-contain" /> : <video src={imageUrl} controls className="max-h-36 max-w-full" aria-label="Local video preview" />}
        <span className="max-w-full truncate text-sm font-semibold">{file.name}</span>
        <span className="text-xs text-muted-foreground">Previewed locally in your browser. No analysis performed.</span>
        <Button type="button" size="sm" variant="ghost" onClick={reset} aria-label="Remove selected file"><X /> Remove</Button>
      </div> : example ? <div className="flex flex-col items-center gap-3">
        {(() => { const Icon = exampleInfo[example].Icon; return <Icon className="size-12 text-primary" strokeWidth={1.2} />; })()}
        <strong className="text-lg">{exampleInfo[example].title}</strong>
        <span className="text-sm text-muted-foreground">{exampleInfo[example].kind} · No media or scan result</span>
        <Button type="button" size="sm" variant="ghost" onClick={reset} aria-label="Clear example"><X /> Clear</Button>
      </div> : <>
        <div className="mb-5 grid size-14 place-items-center border border-border bg-card text-primary"><UploadCloud className="size-6" strokeWidth={1.5} /></div>
        <strong className="max-w-xs text-lg leading-snug">Drop media or documents here to scan for AI manipulation</strong>
        <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">Design preview only. Files stay in this browser; no scanning is available.</p>
        <Button type="button" variant="outline" className="mt-5" onClick={() => input.current?.click()}>Choose a file <ArrowRight /></Button>
        <span className="mt-3 text-xs text-muted-foreground">MP4, JPG or PNG · Max 20 MB</span>
      </>}
    </div>
    <p role="alert" className="mt-2 min-h-5 text-xs cyber-alert">{error}</p>
    <div className="mt-2 border-t border-border pt-4">
      <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Explore a scenario</p>
      <div className="flex flex-wrap gap-2">{(["portrait", "invoice", "audio"] as const).map((key) => <Button key={key} type="button" size="sm" variant={example === key ? "default" : "outline"} className="h-auto min-h-9 max-w-full whitespace-normal px-3 py-2 text-left text-xs" onClick={() => { setFile(null); setImageUrl(null); setExample(key); setError(""); }}>{key === "portrait" ? "Try AI Portrait Example" : key === "invoice" ? "Try Fabricated Invoice" : "Try Synthetic Audio Clip"}</Button>)}</div>
    </div>
  </div>;
}

function CybersecurityConcept() {
  const [paragraph, setParagraph] = useState("");
  return <div className="cyber-page min-h-screen font-sans">
    <header className="border-b border-border bg-background"><div className="mx-auto grid min-h-18 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:px-8">
      <Link to="/cybersecurity-concept" className="flex min-w-0 items-center gap-3" aria-label="VERFI AI concept home"><span className="grid size-9 shrink-0 place-items-center border border-primary text-primary"><Fingerprint className="size-5" /></span><span className="truncate text-lg font-extrabold">VERFI AI<span className="ml-2 align-middle text-[10px] font-semibold uppercase text-muted-foreground">/ Concept</span></span></Link>
      <nav className="flex items-center gap-3 sm:gap-7 text-xs font-semibold uppercase"><Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">Research site</Link><a href="mailto:hello@verfiai.app?subject=VERFI%20AI%20cybersecurity%20concept" className="hidden text-primary transition-opacity hover:opacity-70 sm:block">Get in touch <ArrowRight className="ml-1 inline size-3" /></a></nav>
    </div></header>

    <main>
      <section className="relative isolate overflow-hidden border-b border-border bg-background">
        <img src={forensicImage} alt="Illustrative forensic inspection of a portrait and invoice" width={1600} height={1000} className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-50 lg:opacity-65" />
        <div className="cyber-hero-shade absolute inset-0 -z-10" />
        <div className="cyber-grid absolute inset-0 -z-10 opacity-40" />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:py-16 lg:min-h-[620px] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12">
          <div className="max-w-2xl"><p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase text-primary"><span className="h-px w-8 bg-primary" /> Digital integrity / concept preview</p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.13] sm:text-5xl xl:text-6xl">Instant Digital Integrity: Detect Deepfakes &amp; Document Fraud in Seconds</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-foreground/85 sm:text-lg">A vision for a single place to inspect suspicious media, documents and links—designed for the teams who need to know what they can trust.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" className="h-12 px-5"><a href="mailto:hello@verfiai.app?subject=VERFI%20AI%20API%20interest">Deploy API Now <ArrowRight /></a></Button><Button asChild variant="outline" size="lg" className="h-12 border-foreground/60 bg-background/50 px-5"><a href="mailto:hello@verfiai.app?subject=VERFI%20AI%20enterprise%20demo%20interest">Book Enterprise Demo <ChevronRight /></a></Button></div>
            <p className="mt-4 max-w-md text-xs leading-5 text-muted-foreground">Concept only. An API and enterprise demo are not yet available; these buttons open an email enquiry.</p>
          </div>
          <PreviewZone />
        </div>
      </section>

      <section className="border-b border-border bg-secondary/70"><div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:grid-cols-3 sm:px-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground"><Shield className="size-5 shrink-0 text-primary" /> Media stays in your browser on this page</div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground"><LockKeyhole className="size-5 shrink-0 text-primary" /> No media analysis is performed</div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground"><FileImage className="size-5 shrink-0 text-primary" /> Claim checking is available on the research site</div>
      </div></section>

      <section className="cyber-grid border-b border-border bg-background py-16 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-9 flex flex-col justify-between gap-4 border-b border-border pb-7 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase text-primary">Proposed capabilities / 01—04</p><h2 className="mt-3 max-w-2xl font-display text-3xl font-bold sm:text-4xl">One view across digital risk.</h2></div><p className="max-w-xs text-sm leading-6 text-muted-foreground">These workflows illustrate a future product direction. They do not perform analysis today.</p></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <article className="flex min-h-64 flex-col border border-border bg-card p-6"><ScanFace className="size-7 text-primary" strokeWidth={1.5} /><span className="mt-7 text-xs font-semibold text-muted-foreground">01 / MEDIA</span><h3 className="mt-2 font-display text-xl font-bold">Deepfake &amp; Media Analytics</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">A proposed workflow for reviewing image, video and audio integrity with explainable indicators.</p><p className="mt-auto pt-5 text-xs cyber-alert">Confidence scoring not available</p></article>
          <article className="flex min-h-64 flex-col border border-border bg-card p-6"><FileText className="size-7 text-primary" strokeWidth={1.5} /><span className="mt-7 text-xs font-semibold text-muted-foreground">02 / DOCUMENTS</span><h3 className="mt-2 font-display text-xl font-bold">Document Forensics &amp; OCR</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Concept for reviewing document structure, extracted text and pixel-level inconsistencies.</p><p className="mt-auto pt-5 text-xs text-muted-foreground">Concept only · no OCR is performed</p></article>
          <article className="flex min-h-64 flex-col border border-border bg-card p-6"><Link2 className="size-7 text-primary" strokeWidth={1.5} /><span className="mt-7 text-xs font-semibold text-muted-foreground">03 / LINKS</span><h3 className="mt-2 font-display text-xl font-bold">Phishing &amp; Link Evaluation</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">An intended domain and link-review workflow for flagging suspicious patterns.</p><p className="mt-auto pt-5 text-xs text-muted-foreground">Concept only · no domain checks</p></article>
          <article className="flex min-h-64 flex-col border border-border bg-card p-6"><CircleAlert className="size-7 text-primary" strokeWidth={1.5} /><span className="mt-7 text-xs font-semibold text-muted-foreground">04 / CLAIMS</span><h3 className="mt-2 font-display text-xl font-bold">Real-time Fact Checking</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Text-based claim checking is already available on the existing VERFI AI research site.</p><label htmlFor="cyber-paragraph" className="mt-5 text-xs font-semibold text-muted-foreground">Draft a paragraph</label><textarea id="cyber-paragraph" value={paragraph} onChange={e => setParagraph(e.target.value)} rows={3} placeholder="Paste a claim or paragraph…" className="mt-2 w-full resize-y border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary" /><Button asChild variant="outline" size="sm" className="mt-3 self-start"><Link to="/app">Open claim checker <ArrowRight /></Link></Button><p className="mt-2 text-xs text-muted-foreground">Copy your paragraph into the claim checker to run a real check.</p></article>
        </div>
      </div></section>
    </main>
    <footer className="border-t border-border bg-background"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"><span className="font-bold text-foreground">VERFI AI <span className="font-normal text-muted-foreground">/ Concept preview</span></span><span>No files are uploaded or analyzed on this page.</span><Link to="/" className="text-primary hover:underline">Return to the research site <ArrowRight className="inline size-3" /></Link></div></footer>
  </div>;
}