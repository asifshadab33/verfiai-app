import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowRight, Check, Clock3, FileText, Globe2, LoaderCircle, Search, ShieldCheck, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Run your research | Research Desk" },
      { name: "description", content: "Prepare a professional research report or try a quick AI search with no personal details required." },
      { property: "og:title", content: "Run your research | Research Desk" },
      { property: "og:description", content: "Prepare a professional research report or try a quick AI search with no personal details required." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

const DAILY_LIMIT = 5;
const LANGUAGES = ["English", "Hindi", "Spanish", "French", "Arabic", "Portuguese"] as const;
type Language = (typeof LANGUAGES)[number];

const answerCopy: Record<Language, { summary: string; laptop: string[]; general: string[]; closing: string; note: string }> = {
  English: {
    summary: "Here's a concise starting point for your question:",
    laptop: ["**Acer Aspire 5** — a balanced choice for everyday coursework.", "**Lenovo IdeaPad Slim 3** — good value for writing, browsing, and video calls.", "**ASUS Vivobook 15** — a larger screen for multitasking.", "**HP Pavilion 14** — portable for commuting between classes.", "**Apple MacBook Air (refurbished)** — worth comparing if battery life matters most."],
    general: ["**Start with the core criteria.** Define what matters most: budget, quality, availability, and timing.", "**Compare a few strong options.** Look at independent reviews, current prices, and limitations before deciding.", "**Check the latest details.** Availability and recommendations can change quickly."],
    closing: "For the best decision, compare current prices and independent reviews in your location.",
    note: "This is a sample answer, not a live web search. Details have not been verified.",
  },
  Hindi: {
    summary: "आपके सवाल के लिए एक संक्षिप्त शुरुआत:",
    laptop: ["**Acer Aspire 5** — रोज़मर्रा की पढ़ाई के लिए संतुलित विकल्प।", "**Lenovo IdeaPad Slim 3** — लिखने, ब्राउज़िंग और वीडियो कॉल के लिए अच्छा मूल्य।", "**ASUS Vivobook 15** — कई काम एक साथ करने के लिए बड़ी स्क्रीन।", "**HP Pavilion 14** — कक्षाओं के बीच ले जाने में आसान।", "**Apple MacBook Air (refurbished)** — बैटरी लाइफ़ अहम हो तो तुलना करें।"],
    general: ["**ज़रूरी मानदंड तय करें।** बजट, गुणवत्ता, उपलब्धता और समय देखें।", "**कुछ अच्छे विकल्पों की तुलना करें।** निर्णय से पहले स्वतंत्र समीक्षाएँ और कीमतें देखें।", "**नई जानकारी जाँचें।** उपलब्धता और सुझाव बदल सकते हैं।"],
    closing: "बेहतर निर्णय के लिए अपने क्षेत्र की वर्तमान कीमतें और स्वतंत्र समीक्षाएँ देखें।",
    note: "यह एक नमूना उत्तर है, लाइव वेब खोज नहीं। विवरण सत्यापित नहीं किए गए हैं।",
  },
  Spanish: {
    summary: "Aquí tienes un punto de partida para tu pregunta:",
    laptop: ["**Acer Aspire 5** — opción equilibrada para tareas cotidianas.", "**Lenovo IdeaPad Slim 3** — buena relación calidad-precio para escribir y navegar.", "**ASUS Vivobook 15** — pantalla amplia para varias tareas.", "**HP Pavilion 14** — fácil de llevar entre clases.", "**Apple MacBook Air (reacondicionado)** — compáralo si priorizas la batería."],
    general: ["**Define tus criterios.** Considera presupuesto, calidad, disponibilidad y plazo.", "**Compara varias opciones.** Revisa opiniones independientes, precios y limitaciones.", "**Comprueba la información reciente.** Las recomendaciones pueden cambiar."],
    closing: "Para decidir mejor, compara los precios actuales y las reseñas independientes en tu zona.",
    note: "Esta es una respuesta de ejemplo, no una búsqueda web en vivo. Los datos no están verificados.",
  },
  French: {
    summary: "Voici un point de départ pour votre question :",
    laptop: ["**Acer Aspire 5** — un choix équilibré pour les études.", "**Lenovo IdeaPad Slim 3** — bon rapport qualité-prix pour écrire et naviguer.", "**ASUS Vivobook 15** — grand écran pour le multitâche.", "**HP Pavilion 14** — facile à transporter entre les cours.", "**Apple MacBook Air (reconditionné)** — à comparer si l'autonomie compte."],
    general: ["**Définissez vos critères.** Pensez au budget, à la qualité et à la disponibilité.", "**Comparez plusieurs options.** Consultez les avis indépendants et les prix actuels.", "**Vérifiez les détails récents.** Les recommandations évoluent."],
    closing: "Pour mieux décider, comparez les prix et les avis indépendants dans votre région.",
    note: "Ceci est un exemple de réponse, pas une recherche web en direct. Les informations ne sont pas vérifiées.",
  },
  Arabic: {
    summary: "إليك نقطة بداية موجزة لسؤالك:",
    laptop: ["**Acer Aspire 5** — خيار متوازن للدراسة اليومية.", "**Lenovo IdeaPad Slim 3** — قيمة جيدة للكتابة والتصفح.", "**ASUS Vivobook 15** — شاشة كبيرة لتعدد المهام.", "**HP Pavilion 14** — سهل الحمل بين المحاضرات.", "**Apple MacBook Air (مجدد)** — يستحق المقارنة إذا كانت البطارية أهم ما لديك."],
    general: ["**حدد أولوياتك.** ضع الميزانية والجودة والتوفر والوقت في الحسبان.", "**قارن بين عدة خيارات.** راجع التقييمات المستقلة والأسعار الحالية.", "**تحقق من أحدث المعلومات.** قد تتغير التوصيات بسرعة."],
    closing: "لاتخاذ قرار أفضل، قارن الأسعار الحالية والمراجعات المستقلة في منطقتك.",
    note: "هذه إجابة تجريبية وليست بحثاً مباشراً على الويب. لم يتم التحقق من التفاصيل.",
  },
  Portuguese: {
    summary: "Aqui está um ponto de partida para a sua pergunta:",
    laptop: ["**Acer Aspire 5** — opção equilibrada para estudar.", "**Lenovo IdeaPad Slim 3** — bom custo-benefício para escrever e navegar.", "**ASUS Vivobook 15** — tela maior para várias tarefas.", "**HP Pavilion 14** — fácil de levar para as aulas.", "**Apple MacBook Air (recondicionado)** — compare se a bateria for prioridade."],
    general: ["**Defina os critérios.** Considere orçamento, qualidade, disponibilidade e prazo.", "**Compare boas opções.** Veja avaliações independentes e preços atuais.", "**Confira informações recentes.** As recomendações podem mudar."],
    closing: "Para decidir melhor, compare os preços atuais e avaliações independentes na sua região.",
    note: "Esta é uma resposta de exemplo, não uma pesquisa ao vivo. Os detalhes não foram verificados.",
  },
};

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function mockAnswer(question: string, language: Language) {
  const copy = answerCopy[language];
  const isLaptop = /laptop|notebook|chromebook|ordinateur portable|portátil|computador portátil|लैपटॉप|حاسوب محمول/i.test(question);
  const points = isLaptop ? copy.laptop : copy.general;
  return `## ${question.replace(/\s+/g, " ").trim()}\n\n${copy.summary}\n\n${points.map((point, index) => `${index + 1}. ${point}`).join("\n")}\n\n${copy.closing}\n\n*${copy.note}*`;
}

function ResearchPage() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [remaining, setRemaining] = useState(DAILY_LIMIT);
  const [reportsCreated, setReportsCreated] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("research-desk-quick-usage") || "null") as { date?: string; used?: number } | null;
      if (saved?.date === todayKey() && typeof saved.used === "number") {
        setRemaining(Math.max(0, DAILY_LIMIT - Math.min(DAILY_LIMIT, saved.used)));
      }
      setReportsCreated(Number(localStorage.getItem("research-desk-report-count")) || 0);
    } catch { /* Browser storage is optional for this mock. */ }
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || remaining <= 0 || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setAnswer("");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setAnswer(mockAnswer(question.trim(), language));
    setRemaining((current) => {
      const next = Math.max(0, current - 1);
      try { localStorage.setItem("research-desk-quick-usage", JSON.stringify({ date: todayKey(), used: DAILY_LIMIT - next })); } catch { /* Storage may be disabled. */ }
      return next;
    });
    setLoading(false);
    inFlight.current = false;
  }

  function handleReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReportSubmitted(true);
    setReportsCreated((current) => {
      const next = current + 1;
      try { localStorage.setItem("research-desk-report-count", String(next)); } catch { /* Storage may be disabled. */ }
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-17 max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3" aria-label="Research Desk">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><Sparkle className="size-5" strokeWidth={2.3} /></span>
            <span className="font-display text-lg font-extrabold">research<span className="text-brand">desk.</span></span>
          </div>
          <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex"><span className="size-1.5 rounded-full bg-success" /> YOUR RESEARCH WORKSPACE</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-12 md:px-8 md:pt-18">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase text-brand"><span className="h-px w-6 bg-brand" /> THE RESEARCH STUDIO</div>
          <h1 className="font-display text-4xl font-extrabold leading-tight md:text-6xl">Run your research<span className="text-brand">.</span></h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">Go deep with a professional report, or get a quick starting point in seconds.</p>
        </div>

        <Tabs defaultValue="professional" className="w-full">
          <TabsList className="mb-10 grid h-13 w-full max-w-md grid-cols-2 rounded-full border border-border bg-secondary p-1.5">
            <TabsTrigger value="professional" className="h-full gap-2 rounded-full px-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"><FileText className="size-4 shrink-0" /> Professional Report</TabsTrigger>
            <TabsTrigger value="quick" className="h-full gap-2 rounded-full px-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"><Search className="size-4 shrink-0" /> Quick AI Search</TabsTrigger>
          </TabsList>

          <TabsContent value="professional" className="mt-0">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-20">
              <section className="min-w-0">
                <div className="mb-8 flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand"><FileText className="size-5" /></span>
                  <div><h2 className="font-display text-2xl font-bold">Professional Report</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Tell us what you’re researching to prepare a detailed brief.</p></div>
                </div>
                <form onSubmit={handleReport} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="field-label">Company <span className="text-brand">*</span><Input required name="company" placeholder="e.g. Acme Inc." className="field-input" /></label>
                    <label className="field-label">Industry <span className="text-brand">*</span><Input required name="industry" placeholder="e.g. Consumer technology" className="field-input" /></label>
                  </div>
                  <label className="field-label">Competitors <span className="font-normal text-muted-foreground">(optional)</span><Input name="competitors" placeholder="e.g. Company A, Company B" className="field-input" /><span className="field-hint">Separate multiple competitors with commas.</span></label>
                  <label className="field-label">Research focus <span className="font-normal text-muted-foreground">(optional)</span><Textarea name="focus" placeholder="What would you like the report to focus on?" className="field-textarea min-h-28" /></label>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="field-label">Your name <span className="text-brand">*</span><Input required name="name" placeholder="Your full name" className="field-input" /></label>
                    <label className="field-label">Email address <span className="text-brand">*</span><Input required type="email" name="email" placeholder="you@company.com" className="field-input" /></label>
                  </div>
                  <div className="flex flex-wrap items-center gap-5 pt-1">
                    <Button type="submit" size="lg" className="h-12 px-7 font-semibold">Prepare report brief <ArrowRight className="size-4" /></Button>
                    <span className="text-xs text-muted-foreground">Reports prepared: {reportsCreated}</span>
                  </div>
                  {reportSubmitted && <p role="status" className="flex items-start gap-2 rounded-md border border-success/30 bg-success-soft p-4 text-sm text-foreground"><Check className="mt-0.5 size-4 shrink-0 text-success" /> Your report brief is prepared. Full report generation is not connected yet.</p>}
                </form>
              </section>
              <aside className="border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
                <div className="mb-8 text-xs font-bold uppercase text-muted-foreground">FOR A CLOSER LOOK</div>
                <div className="space-y-8">
                  <div className="flex gap-4"><span className="font-display text-lg font-bold text-brand">01</span><div><h3 className="font-semibold">Your company</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Put your business in context with the market around it.</p></div></div>
                  <div className="flex gap-4"><span className="font-display text-lg font-bold text-brand">02</span><div><h3 className="font-semibold">Your competitors</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Focus on the names and comparisons that matter.</p></div></div>
                  <div className="flex gap-4"><span className="font-display text-lg font-bold text-brand">03</span><div><h3 className="font-semibold">Your questions</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Shape the brief around the decisions you're making.</p></div></div>
                </div>
                <div className="mt-10 flex items-center gap-2 border-t border-border pt-7 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-brand" /> A dedicated space for your research.</div>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="quick" className="mt-0">
            <div className="max-w-3xl">
              <div className="mb-8 flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand"><Search className="size-5" /></span>
                <div><h2 className="font-display text-2xl font-bold">Quick AI Search</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">A quick answer, no personal details needed.</p></div>
              </div>

              <form onSubmit={handleSearch}>
                <label htmlFor="quick-question" className="mb-3 block text-sm font-semibold">What would you like to know?</label>
                <Textarea id="quick-question" value={question} onChange={(event) => setQuestion(event.target.value)} required maxLength={800} placeholder="Ask anything... e.g., What are the top 5 budget laptops for students in 2026?" className="field-textarea min-h-44 resize-y p-5 text-base leading-relaxed md:text-base" />
                <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
                  <div className="w-44"><label htmlFor="quick-language" className="mb-2 flex items-center gap-2 text-sm font-semibold"><Globe2 className="size-4 text-brand" /> Language</label>
                    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}><SelectTrigger id="quick-language" className="field-select h-11"><SelectValue /></SelectTrigger><SelectContent>{LANGUAGES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <Button type="submit" size="lg" disabled={loading || remaining === 0 || !question.trim()} className="h-12 min-w-42 px-6 font-semibold"><Search className="size-4" /> Search Now</Button>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-xs text-muted-foreground"><span>Free for everyone. Supported by ads.</span><span className="flex items-center gap-1.5 font-medium"><Clock3 className="size-3.5" /> Quick Search Limit: {remaining} {remaining === 1 ? "search" : "searches"} remaining today</span></div>
              </form>

              {loading && <div role="status" aria-live="polite" className="mt-10 flex items-center gap-4 border-t border-border pt-8 text-sm font-medium"><LoaderCircle className="size-5 animate-spin text-brand motion-reduce:animate-none" /> AI is searching the web and thinking...</div>}
              {answer && !loading && <section aria-label="Quick search answer" className="mt-10 border-t border-border pt-8"><div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase text-brand"><span className="size-1.5 rounded-full bg-brand" /> YOUR ANSWER</div><div className="answer-markdown max-w-none"><ReactMarkdown>{answer}</ReactMarkdown></div><div className="mt-9 flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/60 p-6 text-center"><span className="text-xs font-semibold uppercase text-muted-foreground">Advertisement</span><span className="text-sm text-muted-foreground">📢 Sponsored Ad</span></div></section>}
              {remaining === 0 && !loading && <p role="status" className="mt-7 rounded-md border border-brand/25 bg-brand-soft p-4 text-sm leading-relaxed">You've reached your daily limit of 5 free searches. Upgrade to Pro for unlimited searches, or come back tomorrow!</p>}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}