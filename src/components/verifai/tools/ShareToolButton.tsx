import { useState } from "react";
import { Check, Code, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Copies the clean page URL (no query/hash, so no entered text leaks) or an embed link snippet. */
export function ShareToolButton({ title }: { title: string }) {
  const [copied, setCopied] = useState<"" | "link" | "embed">("");
  const copy = async (kind: "link" | "embed") => {
    const url = `https://verfiai.app${window.location.pathname}`;
    const text =
      kind === "link"
        ? url
        : `<a href="${url}" rel="noopener">${title.replace(/[<>&"]/g, "")} — free tool by Verfiai</a>`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      /* Clipboard may be blocked; nothing to undo. */
    }
  };
  return (
    <div className="mb-4 flex flex-wrap gap-2" aria-live="polite">
      <Button type="button" variant="outline" size="sm" onClick={() => copy("link")}>
        {copied === "link" ? <Check aria-hidden /> : <Share2 aria-hidden />}
        {copied === "link" ? "Link copied" : "Share tool"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => copy("embed")}>
        {copied === "embed" ? <Check aria-hidden /> : <Code aria-hidden />}
        {copied === "embed" ? "Embed code copied" : "Copy embed link"}
      </Button>
    </div>
  );
}
