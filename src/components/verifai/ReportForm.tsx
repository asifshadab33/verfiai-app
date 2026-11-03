import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, FileText, LoaderCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useImageOcr } from "./useImageOcr";
import { GenerationProgress } from "./GenerationProgress";
import { ReportView } from "./ReportView";
import { UploadNotice } from "./UploadNotice";
import { VoiceButton } from "./VoiceButton";
import { useAuth } from "@/hooks/useAuth";
import {
  generateReport,
  getReportUsage,
  MONTHLY_REPORT_LIMIT,
  type ResearchReport,
} from "@/lib/report.functions";
import { languages, type Lang } from "@/lib/translations";
import { siteText } from "@/lib/site-i18n";
import { translations } from "@/lib/i18n/interface";
import { useVerificationProgress } from "@/hooks/useVerificationProgress";
import { extractFileText } from "@/lib/extract-file-text";
type TextKey = Parameters<typeof siteText>[1];

export function ReportForm({ lang, onLang }: { lang: Lang; onLang: (l: Lang) => void }) {
  const tx = (key: TextKey) => siteText(lang, key);
  const generate = useServerFn(generateReport);
  const fetchUsage = useServerFn(getReportUsage);
  const { user, loading: authLoading } = useAuth();
  const [question, setQuestion] = useState("");
  const [task, setTask] = useState<"claim" | "topic" | "business">("topic");
  const [attachment, setAttachment] = useState("");
  const [filename, setFilename] = useState("");
  const [fileError, setFileError] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [focus, setFocus] = useState("");
  const format = "extended" as const; // single format: capped at 4,000 characters
  const ocr = useImageOcr(lang, (t) =>
    setQuestion((q) => ((q ? q.trimEnd() + "\n\n" : "") + t).slice(0, 4000)),
  );
  const [mode, setMode] = useState<"Balanced" | "Fast" | "Focused" | "Comparative">("Balanced");
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [reportId, setReportId] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const progress = useVerificationProgress();
  const [error, setError] = useState("");
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(MONTHLY_REPORT_LIMIT);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (user)
      fetchUsage()
        .then((u) => {
          setUsed(u.used);
          setLimit(u.limit);
        })
        .catch(() => {});
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const left = Math.max(0, limit - used);
  async function readFile(file: File) {
    setFileError("");
    if (!/\.(txt|md|csv|docx|pdf)$/i.test(file.name) || file.size > 5 * 1024 * 1024) {
      setFileError(tx("uploadError"));
      return;
    }
    try {
      const text = await extractFileText(file);
      if (!text.trim()) {
        setFileError(tx("fileEmpty"));
        return;
      }
      setAttachment(text.slice(0, 12000));
      setFilename(file.name);
    } catch {
      setFileError(tx("fileUnreadable"));
    }
  }
  async function submit() {
    if (busy || authLoading || !user || left === 0) return; // reports require a signed-in account
    if (question.trim().length < 10) {
      setError(tx("tooShort"));
      return;
    }
    setBusy(true);
    setError("");
    setReport(null);
    try {
      const stream = await progress.start();
      const payload = {
        task,
        question,
        attachment,
        language: languages.find((l) => l.code === lang)?.name ?? "English",
        mode,
        company,
        website,
        industry,
        competitors,
        focus,
        format,
        progress: stream,
      };
      const result = await generate({ data: payload });
      if ("limitReached" in result) {
        setError(result.message ?? "");
        return;
      }
      setReport(result.report);
      setReportId("id" in result ? String(result.id) : undefined);
      setUsed(used + 1);
      setTimeout(
        () => document.getElementById("report-output")?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : tx("errorTitle"));
    } finally {
      progress.stop();
      setBusy(false);
    }
  }
  return (
    <div>
      <div className="grid gap-9 lg:grid-cols-[1fr_300px]">
        <div>
          <h2 className="font-display text-2xl font-bold">{translations[lang].start_research}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{tx("formBody")}</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              {translations[lang].task_type}
              <select
                value={task}
                onChange={(e) => setTask(e.target.value as typeof task)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 font-normal"
              >
                <option value="claim">{tx("taskClaim")}</option>
                <option value="topic">{tx("taskTopic")}</option>
                <option value="business">{tx("taskBusiness")}</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              {translations[lang].report_language}
              <select
                value={lang}
                onChange={(e) => onLang(e.target.value as Lang)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 font-normal"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {translations[l.code].name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label htmlFor="research-question" className="mt-5 block text-sm font-semibold">
            {translations[lang].research_question}
          </label>
          <div className="relative mt-2">
            <Textarea
              id="research-question"
              {...ocr.handlers}
              aria-describedby="question-ocr"
              dir={translations[lang].dir}
              lang={lang}
              maxLength={4000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={translations[lang].placeholder_question}
              className={`min-h-40 border-input bg-card p-4 pb-14 text-base ${ocr.over ? "ring-2 ring-brand" : ""}`}
            />
            <div className="absolute bottom-3 end-3">
              <VoiceButton
                iconOnly
                lang={lang}
                label={translations[lang].speak_request}
                onText={(t) => setQuestion((q) => (q ? q.trimEnd() + " " : "") + t)}
              />
            </div>
          </div>
          <div id="question-ocr">{ocr.status}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["ex1", "ex2", "ex3"] as const).map((key) => (
              <Button
                key={key}
                size="sm"
                variant="outline"
                className="h-auto max-w-full whitespace-normal text-start"
                onClick={() => setQuestion(tx(key))}
              >
                {tx(key)}
              </Button>
            ))}
          </div>
          <div className="mt-7 border-y border-border py-5">
            <input
              ref={inputRef}
              type="file"
              aria-label={translations[lang].attachment}
              accept=".txt,.md,.csv,.docx,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void readFile(f);
                e.target.value = "";
              }}
            />
            <UploadNotice />
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) void readFile(f);
              }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button variant="outline" onClick={() => inputRef.current?.click()}>
                <Upload />
                {translations[lang].attachment}
              </Button>
              <span className="text-xs text-muted-foreground">{tx("uploadHint")}</span>
            </div>
            {filename && (
              <p className="mt-3 flex items-center gap-2 text-sm">
                <FileText className="size-4" />
                {filename}
                <Button
                  aria-label={tx("removeFile")}
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFilename("");
                    setAttachment("");
                  }}
                >
                  <X />
                </Button>
              </p>
            )}
            {fileError && (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {fileError}
              </p>
            )}
          </div>
          <details className="group border-b border-border py-5">
            <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold">
              <span className="group-open:hidden">{translations[lang].show_advanced}</span>
              <span className="hidden group-open:inline">{translations[lang].hide_advanced}</span>
              <span className="font-normal text-muted-foreground">{tx("optional")}</span>
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["company", company, setCompany],
                  ["website", website, setWebsite],
                  ["industry", industry, setIndustry],
                  ["competitors", competitors, setCompetitors],
                ] as const
              ).map(([key, value, setter]) => (
                <label key={key} className="text-sm font-medium">
                  {tx(key)}
                  <Input
                    value={value}
                    maxLength={200}
                    onChange={(e) => setter(e.target.value)}
                    className="mt-2 bg-card"
                    dir="auto"
                  />
                </label>
              ))}
              <label className="text-sm font-medium sm:col-span-2">
                {tx("focus")}
                <Textarea
                  id="focus-data"
                  dir="auto"
                  value={focus}
                  maxLength={500}
                  onChange={(e) => setFocus(e.target.value)}
                  className="mt-2 min-h-20 bg-card"
                />
              </label>
              <label className="text-sm font-medium">
                {tx("mode")}
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as typeof mode)}
                  className="mt-2 h-9 w-full rounded-md border border-input bg-card px-3"
                >
                  {(["Balanced", "Fast", "Focused", "Comparative"] as const).map((m) => (
                    <option key={m} value={m}>
                      {tx(
                        (
                          {
                            Balanced: "modeBalanced",
                            Fast: "modeQuick",
                            Focused: "modeDeep",
                            Comparative: "modeComparative",
                          } as const
                        )[m],
                      )}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </details>
          {!authLoading && !user ? (
            <div className="mt-6 flex flex-wrap items-center gap-4 border border-border bg-secondary p-5">
              <p className="text-sm">{tx("signInForReports")}</p>
              <Button asChild>
                <Link to="/auth">{tx("signInContinue")}</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="h-12 px-7"
                onClick={submit}
                disabled={busy || left === 0 || authLoading}
              >
                {busy ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
                {busy ? tx("reportBusy") : translations[lang].generate_report}
              </Button>
              <span className="text-sm text-muted-foreground">{`${left} / ${limit} ${tx("reportRemaining")}`}</span>
            </div>
          )}
          {user && left === 0 && (
            <p role="status" className="mt-4 text-sm text-muted-foreground">
              {tx("limit")}
            </p>
          )}
          {error && (
            <div
              role="alert"
              className="mt-5 flex flex-wrap items-center gap-3 text-sm text-destructive"
            >
              {error}
              {!/used your/.test(error) && (
                <Button variant="outline" size="sm" disabled={busy} onClick={submit}>
                  {tx("retry")}
                </Button>
              )}
            </div>
          )}
          <GenerationProgress active={busy} lang={lang} event={progress.event} />
          <p className="mt-5 text-xs leading-5 text-muted-foreground">{tx("reportPrivacy")}</p>
          <p
            role="note"
            className="mt-3 border-s-2 border-warning bg-warning-soft p-3 text-xs font-medium leading-5"
          >
            {translations[lang].disclaimer}
          </p>
        </div>
        <div className="border-t border-border pt-7 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
          <p className="text-xs font-bold uppercase text-brand">{tx("previewLabel")}</p>
          <h3 className="mt-4 font-display text-xl font-bold">{tx("sampleTitle")}</h3>
          <p className="mt-3 text-sm text-muted-foreground">{tx("sampleBadge")}</p>
          <div className="mt-6 space-y-4 border-s-2 border-border ps-4 text-sm">
            <p className="font-semibold">{tx("sampleTopic")}</p>
            <p className="text-muted-foreground">{tx("sampleSummary")}</p>
            <p className="text-muted-foreground">{tx("sampleFinding")}</p>
          </div>
          <Link
            to="/sample-report"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            {tx("heroSecondary")} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
      {report && (
        <div className="mt-16 border-t border-border pt-12 print:mt-0 print:border-0">
          <ReportView report={report} reportId={reportId} />
          <p className="mt-8 text-sm print:hidden">
            {user ? (
              <Link to="/reports" className="font-semibold text-brand hover:underline">
                {tx("savedReport")}
              </Link>
            ) : (
              <>{tx("unsavedReport")}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
