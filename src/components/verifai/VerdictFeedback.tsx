import { recentText } from "@/lib/recent-i18n";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { sendVerdictFeedback, FEEDBACK_KINDS } from "@/lib/feedback.functions";
import { uiText, type UiExtraKey } from "@/lib/ui-extra-i18n";

const KEY: Record<(typeof FEEDBACK_KINDS)[number], UiExtraKey> = {
  correct: "fbCorrect",
  needs_review: "fbReview",
  irrelevant_source: "fbIrrelevant",
  better_source: "fbBetter",
  explain: "fbExplain",
};

export function VerdictFeedback({
  claim,
  verdict,
  explanation,
}: {
  claim: string;
  verdict: string;
  explanation?: string;
}) {
  const lang = new URLSearchParams(useLocation().searchStr).get("lang") ?? "en";
  const t = (text: string) => recentText(lang, text);
  const LABEL = Object.fromEntries(FEEDBACK_KINDS.map((k) => [k, uiText(lang, KEY[k])])) as Record<
    (typeof FEEDBACK_KINDS)[number],
    string
  >;
  const send = useServerFn(sendVerdictFeedback);
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [suggest, setSuggest] = useState(false);
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");
  async function go(kind: (typeof FEEDBACK_KINDS)[number], note?: string) {
    if (kind === "better_source" && note === undefined) {
      setSuggest(true);
      return;
    }
    if (kind === "explain") setShowWhy(true);
    setBusy(true);
    setMsg("");
    try {
      const r = await send({ data: { kind, claim, verdict, ...(note ? { note } : {}) } });
      setSent(kind);
      setMsg(
        r.ok
          ? t("Thanks — your feedback was saved.")
          : t("Thanks — you've sent a lot of feedback this hour; please try later."),
      );
      setSuggest(false);
    } catch (e) {
      setMsg(e instanceof Error ? t(e.message) : t("Feedback could not be saved."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-3">
      <div role="group" aria-label={t("Feedback on this verdict")} className="flex flex-wrap gap-2">
        {FEEDBACK_KINDS.map((k) => (
          <Button
            key={k}
            type="button"
            size="sm"
            variant={sent === k ? "default" : "outline"}
            aria-pressed={sent === k}
            disabled={busy}
            className="min-h-11"
            onClick={() => go(k)}
          >
            {LABEL[k]}
          </Button>
        ))}
      </div>
      {suggest && (
        <form
          className="mt-2 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (/^https?:\/\//i.test(url)) void go("better_source", url.slice(0, 1000));
          }}
        >
          <label className="sr-only" htmlFor={`better-${claim.slice(0, 20)}`}>
            {t("Better source link")}
          </label>
          <input
            id={`better-${claim.slice(0, 20)}`}
            type="url"
            dir="ltr"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="min-h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm"
          />
          <Button type="submit" size="sm" className="min-h-11" disabled={busy}>
            {t("Send source")}
          </Button>
        </form>
      )}
      {showWhy && explanation && (
        <p className="mt-2 border-s-2 border-brand ps-3 text-xs text-muted-foreground">
          {explanation}
        </p>
      )}
      <p aria-live="polite" className="mt-1 text-xs text-muted-foreground">
        {msg}
      </p>
    </div>
  );
}
