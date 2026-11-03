import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"copied" | "failed" | null>(null);
  async function copy() {
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      let ta: HTMLTextAreaElement | null = null;
      try {
        ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      } finally {
        ta?.remove();
      }
    }
    setStatus(copied ? "copied" : "failed");
    setTimeout(() => setStatus(null), 2000);
  }
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={className}
      onClick={copy}
      disabled={!text}
    >
      {status === "copied" ? <Check className="size-4" /> : <Copy className="size-4" />}
      <span aria-live="polite">
        {status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : label}
      </span>
    </Button>
  );
}
