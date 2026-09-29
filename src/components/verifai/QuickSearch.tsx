import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceButton } from "@/components/verifai/VoiceButton";

const KEY = "research-desk-quick-usage";
const day = () => new Date().toISOString().slice(0, 10);
function read() { try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); return v?.day === day() ? Number(v.used) || 0 : 0; } catch { return 0; } }
export function QuickSearch({ lang = "en" }: { lang?: string }) {
  const [question, setQuestion] = useState("");
  const [used, setUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState("");
  useEffect(() => setUsed(read()), []);
  function run() {
    if (loading || used >= 3 || question.trim().length < 10) return;
    setLoading(true); setShown("");
    window.setTimeout(() => {
      setShown(question.trim()); setLoading(false);
      const next = used + 1; setUsed(next);
      try { localStorage.setItem(KEY, JSON.stringify({ day: day(), used: next })); } catch { /* optional */ }
    }, 700);
  }
  return <div className="max-w-3xl"><h2 className="font-display text-2xl font-bold">Quick AI search · demo</h2><p className="mt-2 text-sm text-muted-foreground">This is a prompt preview, not a live search. No engines or advertisers are connected to this tab.</p><label htmlFor="quick-question" className="mt-7 block text-sm font-semibold">Your question</label><Textarea id="quick-question" className="mt-2 min-h-36 bg-card" value={question} onChange={e => setQuestion(e.target.value)} placeholder="What would you like to explore?" maxLength={2000} /><div className="mt-3"><VoiceButton lang={lang} onText={t => setQuestion(q => (q ? q.trimEnd() + " " : "") + t)} /></div><div className="mt-5 flex flex-wrap items-center gap-4"><Button disabled={loading || used >= 3 || question.trim().length < 10} onClick={run}><Search />{loading ? "Preparing preview…" : "Preview question"}</Button><span className="text-sm text-muted-foreground">{Math.max(0, 3 - used)} demo previews left today in this browser</span></div>{used >= 3 && <p className="mt-4 text-sm text-muted-foreground">Today's demo limit is reached. It resets tomorrow in this browser.</p>}{shown && <div role="status" className="mt-8 border-l-2 border-primary bg-secondary p-5"><h3 className="font-semibold">Your research starting point</h3><p className="mt-2 whitespace-pre-wrap text-sm">{shown}</p><p className="mt-3 text-sm text-muted-foreground">No answer or source has been generated. Use Professional report for an AI-generated research brief, then check any cited references separately.</p></div>}</div>;
}