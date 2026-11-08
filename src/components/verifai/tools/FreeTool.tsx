import { readSessionCache, writeSessionCache } from "@/lib/tools/session-cache";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CountryCode } from "libphonenumber-js";
import { Button } from "@/components/ui/button";

type Props = { slug: string };
type Result = unknown;
type Flashcard = { front: string; back: string; known: boolean };

const fieldClass =
  "min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";
const labelClass = "mb-1 block text-sm font-medium";
const langs = [
  ["en", "English"],
  ["es", "Spanish"],
  ["fr", "French"],
  ["de", "German"],
  ["it", "Italian"],
  ["pt", "Portuguese"],
  ["nl", "Dutch"],
  ["ru", "Russian"],
  ["zh", "Chinese"],
  ["ja", "Japanese"],
  ["ko", "Korean"],
  ["ar", "Arabic"],
  ["hi", "Hindi"],
  ["bn", "Bengali"],
  ["tr", "Turkish"],
  ["id", "Indonesian"],
  ["fa", "Persian"],
  ["ur", "Urdu"],
  ["sw", "Swahili"],
];
const phoneCountries = [
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["IN", "India"],
  ["NZ", "New Zealand"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["JP", "Japan"],
  ["BR", "Brazil"],
] as const;
const cacheRead = <T,>(
  key: string,
  storage: "sessionStorage" | "localStorage" = "sessionStorage",
): T | undefined => {
  try {
    const raw = window[storage].getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};
const cacheWrite = (
  key: string,
  value: unknown,
  storage: "sessionStorage" | "localStorage" = "sessionStorage",
): boolean => {
  try {
    window[storage].setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export function FreeTool({ slug }: Props) {
  const [query, setQuery] = useState("");
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("US");
  const [mode, setMode] = useState("paper");
  const [recordType, setRecordType] = useState("A");
  const [fromLang, setFromLang] = useState("en");
  const [toLang, setToLang] = useState("es");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result>();
  const [resultLabel, setResultLabel] = useState("");
  const [note, setNote] = useState("");
  const [storageWarning, setStorageWarning] = useState("");
  const [notesText, setNotesText] = useState("");
  const [decks, setDecks] = useState<Record<string, Flashcard[]>>({});
  const [deckName, setDeckName] = useState("My deck");
  const [activeDeck, setActiveDeck] = useState("My deck");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const stopwatchStartedAt = useRef(0);
  const [timerEnd, setTimerEnd] = useState<number>();
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    if (slug === "scratch-notes")
      setNotesText(cacheRead<string>("verfiai-scratch-notes", "localStorage") ?? "");
    if (slug === "flashcards") {
      const saved =
        cacheRead<Record<string, Flashcard[]>>("verfiai-flashcards", "localStorage") ?? {};
      setDecks(saved);
      setActiveDeck(Object.keys(saved)[0] ?? "My deck");
    }
  }, [slug]);
  useEffect(() => {
    if (slug === "scratch-notes") {
      setStorageWarning(
        cacheWrite("verfiai-scratch-notes", notesText, "localStorage")
          ? ""
          : "Browser storage is unavailable; these notes will not persist after leaving this page.",
      );
    }
  }, [slug, notesText]);
  useEffect(() => {
    if (slug === "flashcards") {
      setStorageWarning(
        cacheWrite("verfiai-flashcards", decks, "localStorage")
          ? ""
          : "Browser storage is unavailable; this deck will not persist after leaving this page.",
      );
    }
  }, [slug, decks]);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed(Date.now() - stopwatchStartedAt.current), 100);
    return () => window.clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (!timerEnd) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, timerEnd - Date.now());
      setElapsed(left);
      if (!left) {
        window.clearInterval(id);
        setTimerEnd(undefined);
        setRunning(false);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [timerEnd]);

  const label = useMemo(
    () =>
      (
        ({
          "doaj-journal-checker": "Search journal or article title",
          "semantic-scholar": mode === "author" ? "Author name" : "Paper title or topic",
          opencitations: "DOI",
          "zenodo-finder": mode === "doi" ? "DOI" : "Dataset search",
          "dns-inspector": "Domain name",
          "certificate-explorer": "Domain name",
          "phone-verifier": "Phone number",
          "currency-converter": "Amount",
          "ip-checker": "IP address (leave blank to check yours)",
          dictionary: "English word",
          translator: mode === "word" ? "English word" : "Text to translate",
          "transcript-translator": "Transcript",
        }) as Record<string, string>
      )[slug] ?? "Enter a value",
    [slug, mode],
  );

  const doLookup = async (value = query) => {
    setError("");
    setResult(undefined);
    setResultLabel("");
    setBusy(true);
    try {
      const data = await lookup(slug, value.trim(), {
        mode,
        recordType,
        second,
        third,
        fromLang,
        toLang,
        date: note,
        phoneCountry,
      });
      setResult(data.value);
      setResultLabel(data.label ?? "");
      if (data.note) setNote(data.note);
    } catch (e) {
      const timedOut = e instanceof DOMException && e.name === "TimeoutError";
      setError(
        timedOut && slug === "certificate-explorer"
          ? "The certificate service took too long to respond. Try again in a moment or use a shorter domain."
          : e instanceof Error
            ? e.message
            : "The lookup failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (slug === "scratch-notes") {
    return (
      <section className="space-y-3">
        <label className={labelClass} htmlFor="scratch-notes">
          Your notes
        </label>
        <textarea
          id="scratch-notes"
          className={`${fieldClass} min-h-64`}
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
        />
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Autosaved in this browser only.
        </p>
        {storageWarning && (
          <p role="status" aria-live="polite" className="text-sm text-destructive">
            {storageWarning}
          </p>
        )}
        <Button type="button" onClick={() => downloadText("scratch-notes.txt", notesText)}>
          Export .txt
        </Button>
      </section>
    );
  }

  if (slug === "flashcards") {
    const cards = decks[activeDeck] ?? [];
    const setActiveCards = (update: (items: Flashcard[]) => Flashcard[]) =>
      setDecks((old) => ({ ...old, [activeDeck]: update(old[activeDeck] ?? []) }));
    const current = cards[cardIndex];
    return (
      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className={labelClass}>
            Deck
            <select
              className={fieldClass}
              value={activeDeck}
              onChange={(e) => {
                setActiveDeck(e.target.value);
                setCardIndex(0);
                setFlipped(false);
              }}
            >
              {Object.keys(decks).length ? (
                Object.keys(decks).map((name) => <option key={name}>{name}</option>)
              ) : (
                <option>My deck</option>
              )}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <label className={labelClass}>
              New deck
              <input
                className={fieldClass}
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
              />
            </label>
            <Button
              type="button"
              onClick={() => {
                const name = deckName.trim();
                if (!name) return;
                setDecks((old) => ({ ...old, [name]: old[name] ?? [] }));
                setActiveDeck(name);
                setCardIndex(0);
                setFlipped(false);
              }}
            >
              Create deck
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Front
            <textarea
              className={`${fieldClass} mt-1 min-h-20`}
              value={front}
              onChange={(e) => setFront(e.target.value)}
            />
          </label>
          <label className={labelClass}>
            Back
            <textarea
              className={`${fieldClass} mt-1 min-h-20`}
              value={back}
              onChange={(e) => setBack(e.target.value)}
            />
          </label>
        </div>
        <Button
          type="button"
          onClick={() => {
            if (!front.trim() || !back.trim()) return;
            setActiveCards((old) => [
              ...old,
              { front: front.trim(), back: back.trim(), known: false },
            ]);
            setFront("");
            setBack("");
          }}
        >
          Add card
        </Button>
        {current && (
          <div className="space-y-3 rounded-lg border p-4">
            <p aria-live="polite" className="min-h-12">
              {flipped ? current.back : current.front}
            </p>
            <p className="text-sm text-muted-foreground">
              Card {cardIndex + 1} of {cards.length} · {cards.filter((card) => card.known).length}{" "}
              known
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => setFlipped(!flipped)}>
                Flip card
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setActiveCards((old) =>
                    old.map((card, i) => (i === cardIndex ? { ...card, known: false } : card)),
                  )
                }
              >
                Mark unknown
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setActiveCards((old) =>
                    old.map((card, i) => (i === cardIndex ? { ...card, known: true } : card)),
                  )
                }
              >
                Mark known
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveCards((old) => [...old].sort(() => Math.random() - 0.5))}
              >
                Shuffle
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCardIndex((i) => (i + 1) % cards.length);
                  setFlipped(false);
                }}
              >
                Next card
              </Button>
            </div>
          </div>
        )}
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Deck stays in local browser storage.
        </p>
        {storageWarning && (
          <p role="status" aria-live="polite" className="text-sm text-destructive">
            {storageWarning}
          </p>
        )}
      </section>
    );
  }

  if (slug === "stopwatch-timer") {
    return (
      <section className="space-y-4">
        <p
          className="font-mono text-3xl tabular-nums"
          aria-label={`Elapsed time ${formatTime(elapsed)}`}
        >
          {formatTime(elapsed)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              if (!running) stopwatchStartedAt.current = Date.now() - elapsed;
              setRunning(!running);
              if (!running) setTimerEnd(undefined);
            }}
          >
            {running ? "Pause stopwatch" : "Start stopwatch"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRunning(false);
              setElapsed(0);
              stopwatchStartedAt.current = 0;
              setLaps([]);
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setLaps((old) => [...old, elapsed])}
          >
            Record lap
          </Button>
        </div>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const seconds = Number(query);
            if (Number.isFinite(seconds) && seconds > 0) {
              setRunning(false);
              setElapsed(seconds * 1000);
              setTimerEnd(Date.now() + seconds * 1000);
            }
          }}
        >
          <label className={labelClass}>
            Countdown seconds
            <input
              className={fieldClass}
              type="number"
              min="1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <Button type="submit">Start countdown</Button>
        </form>
        <ol aria-label="Stopwatch laps" className="list-inside list-decimal">
          {laps.map((lap, i) => (
            <li key={`${i}-${lap}`}>
              Lap {i + 1}: {formatTime(lap)}
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (slug === "unit-converter") return <UnitConverter />;
  if (slug === "percentage-calculator") return <PercentageCalculator />;
  if (slug === "calculator") return <BasicCalculator />;
  if (slug === "age-date-calculator") return <AgeDateCalculator />;

  if (slug === "translator" || slug === "transcript-translator") {
    return (
      <section className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            From language code
            <input
              className={fieldClass}
              list="translation-language-list"
              value={slug === "translator" && mode === "word" ? "en" : fromLang}
              disabled={slug === "translator" && mode === "word"}
              onChange={(e) => setFromLang(e.target.value.toLowerCase())}
            />
          </label>
          <label className={labelClass}>
            To language code
            <input
              className={fieldClass}
              list="translation-language-list"
              value={toLang}
              onChange={(e) => setToLang(e.target.value.toLowerCase())}
            />
          </label>
          <datalist id="translation-language-list">
            {langs.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </datalist>
          {slug === "translator" && (
            <label className={labelClass}>
              Mode
              <select className={fieldClass} value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="text">Text</option>
                <option value="word">Single word + English definition</option>
              </select>
            </label>
          )}
        </div>
        <label htmlFor="translation-input" className={labelClass}>
          {label}
        </label>
        {slug === "transcript-translator" ? (
          <TranscriptInput value={query} setValue={setQuery} />
        ) : (
          <textarea
            id="translation-input"
            className={`${fieldClass} min-h-40`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}
        <p className="text-xs text-muted-foreground">
          The on-device translator is tried first when your browser supports it. Otherwise text is
          sent directly to MyMemory in chunks of at most 500 characters.
        </p>
        <Button type="button" disabled={busy || !query.trim()} onClick={() => void doLookup()}>
          {busy ? "Translating…" : "Translate"}
        </Button>
        {result !== undefined && (
          <div aria-live="polite">
            <ResultDisplay
              value={result}
              label={resultLabel}
              sideBySide={slug === "transcript-translator"}
              original={query}
            />
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {note && (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {note}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {(slug === "doaj-journal-checker" ||
        slug === "semantic-scholar" ||
        slug === "zenodo-finder") && (
        <label className={labelClass}>
          Search type
          <select className={fieldClass} value={mode} onChange={(e) => setMode(e.target.value)}>
            {slug === "doaj-journal-checker" ? (
              <>
                <option value="journal">Journal</option>
                <option value="article">Article</option>
              </>
            ) : slug === "semantic-scholar" ? (
              <>
                <option value="paper">Paper</option>
                <option value="author">Author</option>
              </>
            ) : (
              <>
                <option value="dataset">Dataset search</option>
                <option value="doi">Resolve DOI with DataCite</option>
              </>
            )}
          </select>
        </label>
      )}
      {slug === "dns-inspector" && (
        <label className={labelClass}>
          Record type
          <select
            className={fieldClass}
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
          >
            {["A", "AAAA", "MX", "TXT", "NS", "CNAME", "SOA"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      )}
      {slug === "phone-verifier" && (
        <label className={labelClass}>
          Country when number has no calling code
          <select
            className={fieldClass}
            value={phoneCountry}
            onChange={(e) => {
              const country = e.target.value;
              if (phoneCountries.some(([code]) => code === country))
                setPhoneCountry(country as CountryCode);
            }}
          >
            {phoneCountries.map(([code, name]) => (
              <option value={code} key={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
      )}
      {slug === "currency-converter" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            From currency
            <input
              className={fieldClass}
              value={second || "USD"}
              onChange={(e) => setSecond(e.target.value.toUpperCase())}
              maxLength={3}
            />
          </label>
          <label className={labelClass}>
            To currency
            <input
              className={fieldClass}
              value={third || "EUR"}
              onChange={(e) => setThird(e.target.value.toUpperCase())}
              maxLength={3}
            />
          </label>
          <label className={labelClass}>
            Historical date (optional)
            <input
              className={fieldClass}
              type="date"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
      )}
      {slug === "translator" && null}
      <label htmlFor="tool-query" className={labelClass}>
        {label}
      </label>
      <input
        id="tool-query"
        className={fieldClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void doLookup();
          }
        }}
      />
      {slug === "ip-checker" && (
        <Button type="button" variant="outline" onClick={() => void doLookup("")}>
          What is my IP?
        </Button>
      )}
      <Button type="button" disabled={busy || !query.trim()} onClick={() => void doLookup()}>
        {busy ? "Looking up…" : slug === "phone-verifier" ? "Validate number" : "Search"}
      </Button>
      {busy && (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          Contacting the public service…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {result !== undefined && (
        <div aria-live="polite">
          <ResultDisplay value={result} label={resultLabel} />
        </div>
      )}
      {note && slug !== "currency-converter" && (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {note}
        </p>
      )}
    </section>
  );
}

async function lookup(
  slug: string,
  query: string,
  opts: {
    mode: string;
    recordType: string;
    second: string;
    third: string;
    fromLang: string;
    toLang: string;
    date: string;
    phoneCountry: CountryCode;
  },
): Promise<{ value: Result; label?: string; note?: string }> {
  if (slug === "phone-verifier") {
    const { parsePhoneNumberFromString } = await import("libphonenumber-js");
    const parsed = parsePhoneNumberFromString(query, opts.phoneCountry);
    return {
      value: parsed
        ? {
            valid: parsed.isValid(),
            possible: parsed.isPossible(),
            country: parsed.country ?? "Unknown",
            type: parsed.getType() ?? "Unknown",
            e164: parsed.number,
            international: parsed.formatInternational(),
          }
        : {
            valid: false,
            message:
              "Number could not be parsed. Include the country calling code (for example, +1).",
          },
    };
  }
  if (slug === "doaj-journal-checker") {
    const key = `doaj:${opts.mode}:${query.toLowerCase()}`;
    const cached = cacheRead<Result>(key);
    if (cached) return { value: cached };
    const endpoint = opts.mode === "journal" ? "journals" : "articles";
    const response = await fetch(
      `https://doaj.org/api/search/${endpoint}/${encodeURIComponent(query)}`,
    );
    if (response.status === 429 || response.status >= 500)
      throw new Error("DOAJ service is temporarily busy. Please try again shortly.");
    if (!response.ok) throw new Error(`DOAJ returned ${response.status}. Please try again later.`);
    const data = (await response.json()) as {
      results?: Array<{ bibjson?: unknown }>;
      total?: number;
    };
    const docs = data.results ?? [];
    const value = {
      indexed: docs.length > 0,
      count: data.total ?? docs.length,
      records: docs.slice(0, 10).map((item) => item.bibjson ?? item),
    };
    cacheWrite(key, value);
    return { value };
  }
  if (slug === "semantic-scholar") {
    const key = `s2:${opts.mode}:${query.toLowerCase()}`;
    const cached = cacheRead<Result>(key);
    if (cached) return { value: cached };
    const isAuthor = opts.mode === "author";
    const url = isAuthor
      ? `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(query)}&limit=10&fields=name,url,paperCount,citationCount,hIndex`
      : `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=title,authors,year,venue,citationCount,openAccessPdf,url,externalIds`;
    const response = await semanticScholarFetch(url);
    if (!response.ok)
      throw new Error(`Semantic Scholar returned ${response.status}. Please try again later.`);
    const data = await response.json();
    cacheWrite(key, data);
    return { value: data };
  }
  if (slug === "opencitations") {
    const doi = query.replace(/^https?:\/\/doi\.org\//i, "").replace(/^doi:/i, "");
    const key = `opencitations:${doi.toLowerCase()}`;
    const cached = cacheRead<Result>(key);
    if (cached) return { value: cached };
    const encoded = encodeURIComponent(`doi:${doi}`);
    const [citations, references] = await Promise.all([
      fetch(`https://opencitations.net/index/api/v2/citation-count/${encoded}`),
      fetch(`https://opencitations.net/index/api/v2/reference-count/${encoded}`),
    ]);
    if (!citations.ok || !references.ok)
      throw new Error("OpenCitations could not resolve that DOI. Check the DOI and try again.");
    const value = {
      inboundCitations: await citations.json(),
      outboundReferences: await references.json(),
      recordUrl: `https://opencitations.net/index/coci/api/v1/citation/${encodeURIComponent(doi)}`,
    };
    cacheWrite(key, value);
    return { value };
  }
  if (slug === "zenodo-finder") {
    const key = `zenodo:${opts.mode}:${query.toLowerCase()}`;
    const cached = cacheRead<Result>(key);
    if (cached) return { value: cached };
    if (opts.mode === "doi") {
      const doi = query.replace(/^https?:\/\/doi\.org\//i, "").replace(/^doi:/i, "");
      const response = await fetch(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`);
      if (response.status === 404) throw new Error("DataCite has no record for that DOI.");
      if (!response.ok) throw new Error(`DataCite returned ${response.status}.`);
      const value = await response.json();
      cacheWrite(key, value);
      return { value };
    }
    const response = await fetch(
      `https://zenodo.org/api/records/?q=${encodeURIComponent(query)}&size=10`,
    );
    if (!response.ok) throw new Error(`Zenodo returned ${response.status}.`);
    const value = await response.json();
    cacheWrite(key, value);
    return { value };
  }
  if (slug === "dns-inspector") {
    const key = `dns:${opts.recordType}:${query.toLowerCase().trim()}`;
    const cached = readSessionCache<Result>(key);
    if (cached !== undefined) return { value: cached };
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(query)}&type=${opts.recordType}`;
    const response = await fetch(url, { headers: { Accept: "application/dns-json" } });
    if (!response.ok) throw new Error(`DNS lookup returned ${response.status}.`);
    const value = await response.json();
    writeSessionCache(key, value);
    return { value };
  }
  if (slug === "certificate-explorer") {
    const domain = query.replace(/^https?:\/\//i, "").split("/")[0] ?? "";
    const normalizedDomain = domain.replace(/^\*\./, "");
    const key = `crtsh:${normalizedDomain.toLowerCase()}`;
    const cached = cacheRead<Result>(key);
    if (cached) return { value: cached };
    const response = await fetch(
      `https://crt.sh/?q=${encodeURIComponent(normalizedDomain)}&output=json`,
      { signal: AbortSignal.timeout(20000) },
    );
    if (response.status === 429 || response.status >= 500)
      throw new Error("crt.sh service is temporarily busy. Please try again shortly.");
    if (!response.ok) throw new Error(`crt.sh returned ${response.status}.`);
    const records = (await response.json()) as Array<{
      name_value?: string;
      issuer_name?: string;
      not_before?: string;
      not_after?: string;
      id?: string | number;
    }>;
    const subdomains = [
      ...new Set(
        records
          .flatMap((row) => String(row.name_value ?? "").split(/\n/))
          .map((name) => name.trim().toLowerCase())
          .filter(Boolean),
      ),
    ].sort();
    const value = {
      certificates: records.length,
      uniqueSubdomains: subdomains.length,
      subdomains,
      records: records.slice(0, 30).map((row) => ({
        name: row.name_value,
        issuer: row.issuer_name,
        issued: row.not_before,
        expires: row.not_after,
        id: row.id,
        url: `https://crt.sh/?id=${row.id}`,
      })),
    };
    cacheWrite(key, value);
    return { value };
  }
  if (slug === "ip-checker") {
    const key = `ipwho:${query || "self"}`;
    const cached = cacheRead<Result>(key);
    if (cached) return { value: cached };
    const response = await fetch(`https://ipwho.is/${query ? encodeURIComponent(query) : ""}`);
    if (response.status === 429)
      throw new Error(
        "The IP lookup service is temporarily rate-limited. Please wait a moment before trying again.",
      );
    if (!response.ok) throw new Error(`IP lookup returned ${response.status}.`);
    const value = await response.json();
    if (value.success === false)
      throw new Error(value.message ?? "That IP address could not be looked up.");
    cacheWrite(key, value);
    return { value };
  }
  if (slug === "currency-converter") {
    const amount = Number(query);
    if (!Number.isFinite(amount)) throw new Error("Enter a valid amount.");
    const date = opts.date;
    const from = (opts.second || "USD").toUpperCase();
    const to = (opts.third || "EUR").toUpperCase();
    const key = `frankfurter-rates:${from}:${to}:${date || "latest"}`;
    const cached = cacheRead<{ rate: number; fetchedAt: number; date?: string }>(
      key,
      "localStorage",
    );
    const fresh = cached && Date.now() - cached.fetchedAt < 3600000;
    let rate = fresh ? cached.rate : undefined;
    if (!rate) {
      const params = new URLSearchParams({ base: from, quotes: to });
      const endpoint = date
        ? `https://api.frankfurter.dev/v2/rates/${encodeURIComponent(date)}?${params}`
        : `https://api.frankfurter.dev/v2/rates?${params}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Frankfurter returned ${response.status}.`);
      const data = (await response.json()) as Array<{ rate?: number; date?: string }>;
      const row = data[0];
      rate = Number(row?.rate);
      if (!Number.isFinite(rate))
        throw new Error("No rate was available for that currency pair and date.");
      cacheWrite(key, { rate, fetchedAt: Date.now(), date: row?.date }, "localStorage");
      return {
        value: {
          amount,
          from,
          to,
          rate,
          converted: amount * rate,
          date: row?.date,
          fetchedAt: new Date().toISOString(),
        },
      };
    }
    return {
      value: {
        amount,
        from,
        to,
        rate,
        converted: amount * rate,
        date: cached!.date,
        fetchedAt: new Date(cached!.fetchedAt).toISOString(),
      },
    };
  }
  if (slug === "dictionary" || (slug === "translator" && opts.mode === "word")) {
    const key = `dictionary:${query.toLowerCase()}`;
    let data = cacheRead<Result>(key);
    if (!data) {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`,
      );
      if (response.status === 429 || response.status >= 500)
        throw new Error("Dictionary API is temporarily busy. Please try again shortly.");
      if (response.status === 404) {
        if (slug === "dictionary") {
          const value = { notFound: true, message: "Word not found." };
          cacheWrite(key, value);
          return { value };
        }
        data = { notFound: true, message: "No English definition was found for this word." };
      } else {
        if (!response.ok) throw new Error(`Dictionary API returned ${response.status}.`);
        data = await response.json();
        cacheWrite(key, data);
      }
    }
    if (slug === "dictionary") return { value: data };
    const translationKey = `translation:en:${opts.toLang}:${query}`;
    const cachedTranslation = cacheRead<{ text: string; provider: string }>(translationKey);
    const translated = cachedTranslation ?? (await translateText(query, "en", opts.toLang));
    if (!cachedTranslation) cacheWrite(translationKey, translated);
    return {
      value: { translation: translated.text, provider: translated.provider, definition: data },
    };
  }
  if (slug === "translator" || slug === "transcript-translator") {
    const key = `translation:${opts.fromLang}:${opts.toLang}:${query}`;
    const cached = cacheRead<{ text: string; provider: string }>(key);
    if (cached) return { value: cached.text, label: `Cached result · ${cached.provider}` };
    const translated = await translateText(query, opts.fromLang, opts.toLang);
    cacheWrite(key, translated);
    return { value: translated.text, label: translated.provider };
  }
  return { value: "No action available." };
}

async function semanticScholarFetch(url: string) {
  if (!navigator.locks?.request) {
    throw new Error(
      "Semantic Scholar search is unavailable because this browser cannot coordinate request pacing across tabs.",
    );
  }
  return navigator.locks.request("verfiai-semantic-scholar", async () => {
    const key = "verfiai-semantic-scholar-pacing";
    let gate: { lastRequestAt?: number; blockedUntil?: number } | null;
    try {
      const raw = localStorage.getItem(key);
      gate = raw ? (JSON.parse(raw) as typeof gate) : null;
    } catch {
      throw new Error(
        "Semantic Scholar search is unavailable because shared browser storage is disabled.",
      );
    }
    const now = Date.now();
    if (gate?.blockedUntil && gate.blockedUntil > now) {
      const minutes = Math.ceil((gate.blockedUntil - now) / 60000);
      throw new Error(
        `Semantic Scholar is rate-limited. Please wait about ${minutes} minute${minutes === 1 ? "" : "s"} before trying again.`,
      );
    }
    const wait = Math.max(0, (gate?.lastRequestAt ?? 0) + 3100 - now);
    if (wait) await new Promise((resolve) => window.setTimeout(resolve, wait));
    try {
      localStorage.setItem(key, JSON.stringify({ lastRequestAt: Date.now() }));
    } catch {
      throw new Error(
        "Semantic Scholar search is unavailable because request pacing could not be saved.",
      );
    }
    const response = await fetch(url);
    if (response.status === 429) {
      const retryAfter = parseRetryAfter(response.headers.get("Retry-After"));
      const blockedUntil = Date.now() + retryAfter;
      try {
        localStorage.setItem(key, JSON.stringify({ lastRequestAt: Date.now(), blockedUntil }));
      } catch {
        throw new Error(
          "Semantic Scholar returned a rate limit, but the browser could not save its Retry-After cooldown. Search is paused for this tab.",
        );
      }
      const minutes = Math.ceil(retryAfter / 60000);
      throw new Error(
        `Semantic Scholar is rate-limited. Please wait about ${minutes} minute${minutes === 1 ? "" : "s"} before trying again.`,
      );
    }
    return response;
  });
}

function parseRetryAfter(value: string | null) {
  if (!value) return 300_000;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : 300_000;
}

async function translateText(text: string, source: string, target: string) {
  const translatorWindow = window as Window & {
    Translator?: {
      availability?: (options: {
        sourceLanguage: string;
        targetLanguage: string;
      }) => Promise<string>;
      create?: (options: {
        sourceLanguage: string;
        targetLanguage: string;
      }) => Promise<{ translate: (text: string) => Promise<string>; destroy?: () => void }>;
    };
  };
  const api = translatorWindow.Translator;
  if (api?.create) {
    try {
      const supported = await api.availability?.({
        sourceLanguage: source,
        targetLanguage: target,
      });
      if (
        !api.availability ||
        supported === "available" ||
        supported === "downloadable" ||
        supported === "downloading"
      ) {
        const translator = await api.create({ sourceLanguage: source, targetLanguage: target });
        const output: string[] = [];
        for (const chunk of splitText(text, 500)) output.push(await translator.translate(chunk));
        translator.destroy?.();
        return { text: output.join(""), provider: "On-device translation (runs on your device)" };
      }
    } catch {
      // Unsupported or unavailable on-device models fall through to the documented public API.
    }
  }
  const translated: string[] = [];
  for (const chunk of splitText(text, 500)) {
    const params = new URLSearchParams({ q: chunk, langpair: `${source}|${target}` });
    const response = await fetch(`https://api.mymemory.translated.net/get?${params}`);
    if (response.status === 429)
      throw new Error("The free daily translation quota is busy. Please try again later.");
    if (!response.ok) throw new Error(`Translation service returned ${response.status}.`);
    const data = await response.json();
    if (Number(data.responseStatus) === 429)
      throw new Error("The free daily translation quota is busy. Please try again later.");
    if (data.responseStatus && Number(data.responseStatus) !== 200)
      throw new Error(
        data.responseDetails || "The translation service could not complete this request.",
      );
    translated.push(data.responseData?.translatedText ?? "");
  }
  return { text: translated.join(""), provider: "MyMemory free translation service" };
}

function splitText(text: string, max: number) {
  const parts: string[] = [];
  let rest = Array.from(text);
  while (rest.length > max) {
    let end = rest.lastIndexOf(" ", max);
    if (end < max * 0.6) end = max;
    parts.push(rest.slice(0, end).join(""));
    rest = rest.slice(end);
  }
  if (rest.length) parts.push(rest.join(""));
  return parts;
}

function TranscriptInput({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  const [loadError, setLoadError] = useState("");
  return (
    <div className="space-y-3">
      <textarea
        id="translation-input"
        className={`${fieldClass} min-h-52`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <label className="block text-sm">
        Load a local text transcript
        <input
          className="mt-1 block min-h-11"
          type="file"
          accept=".txt,.srt,.vtt,.md,text/plain"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setLoadError("");
            if (file)
              void file
                .text()
                .then(setValue)
                .catch(() => setLoadError("This local text file could not be read."));
          }}
        />
      </label>
      {loadError && (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      )}
    </div>
  );
}

function ResultDisplay({
  value,
  label,
  sideBySide = false,
  original = "",
}: {
  value: unknown;
  label?: string;
  sideBySide?: boolean;
  original?: string;
}) {
  const text = typeof value === "string" ? value : null;
  return (
    <div className="mt-4 rounded-lg border bg-muted/20 p-4">
      {label && <p className="mb-2 text-xs text-muted-foreground">{label}</p>}
      {sideBySide && text ? (
        <div className="grid gap-4 md:grid-cols-2">
          <section>
            <h3 className="mb-2 font-semibold">Original</h3>
            <p className="whitespace-pre-wrap break-words">{original}</p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">Translation</h3>
            <p className="whitespace-pre-wrap break-words">{text}</p>
          </section>
        </div>
      ) : text ? (
        <p className="whitespace-pre-wrap break-words">{text}</p>
      ) : (
        <ResultObject value={value} />
      )}
    </div>
  );
}

function ResultObject({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (depth > 4)
    return <p className="text-sm text-muted-foreground">Additional details omitted.</p>;
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    return <span className="break-words">{String(value)}</span>;
  if (Array.isArray(value)) {
    if (!value.length) return <p>No matching records found.</p>;
    return (
      <ol className="space-y-3">
        {value.slice(0, 25).map((item, index) => (
          <li key={index} className="rounded border p-3">
            <ResultObject value={item} depth={depth + 1} />
          </li>
        ))}
      </ol>
    );
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj["notFound"]) return <p>{String(obj["message"] ?? "No match found.")}</p>;
    if (obj["indexed"] !== undefined)
      return (
        <p>
          {obj["indexed"]
            ? `Found ${obj["count"] ?? ""} matching records.`
            : "No matching records found in this index."}
        </p>
      );
    return (
      <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(8rem,auto)_1fr]">
        {Object.entries(obj)
          .filter(([, item]) => item !== undefined && item !== null && typeof item !== "object")
          .map(([key, item]) => (
            <div className="contents" key={key}>
              <dt className="font-semibold">{humanize(key)}</dt>
              <dd className="min-w-0 break-words">
                {key.toLowerCase().includes("url") &&
                typeof item === "string" &&
                item.startsWith("http") ? (
                  <a
                    className="text-brand underline"
                    href={item}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item}
                  </a>
                ) : key.toLowerCase() === "audio" &&
                  typeof item === "string" &&
                  item.startsWith("http") ? (
                  <audio controls preload="none" src={item}>
                    <a href={item}>Play pronunciation</a>
                  </audio>
                ) : (
                  String(item)
                )}
              </dd>
            </div>
          ))}
        {Object.entries(obj)
          .filter(([, item]) => typeof item === "object" && item !== null)
          .map(([key, item]) => (
            <div key={key} className="sm:col-span-2">
              <h4 className="mb-1 font-semibold">{humanize(key)}</h4>
              <ResultObject value={item} depth={depth + 1} />
            </div>
          ))}
      </dl>
    );
  }
  return null;
}

function UnitConverter() {
  const groups: Record<string, Record<string, number>> = {
    length: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      mi: 1609.344,
      yd: 0.9144,
      ft: 0.3048,
      in: 0.0254,
    },
    weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523125 },
    speed: { "m/s": 1, "km/h": 1 / 3.6, mph: 0.44704, knot: 0.514444 },
    area: {
      "m²": 1,
      "km²": 1000000,
      "cm²": 0.0001,
      ha: 10000,
      acre: 4046.8564224,
      "ft²": 0.09290304,
    },
    volume: { L: 1, mL: 0.001, "m³": 1000, gal: 3.785411784, cup: 0.2365882365 },
    data: {
      bit: 0.125,
      B: 1,
      KB: 1000,
      MB: 1e6,
      GB: 1e9,
      TB: 1e12,
      KiB: 1024,
      MiB: 1048576,
      GiB: 1073741824,
      TiB: 1099511627776,
    },
  };
  const [category, setCategory] = useState("length");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("km");
  const [value, setValue] = useState("1");
  const amount = Number(value);
  const converted =
    category === "temperature"
      ? convertTemp(amount, from, to)
      : amount * ((groups[category]?.[from] ?? 1) / (groups[category]?.[to] ?? 1));
  const units =
    category === "temperature" ? ["°C", "°F", "K"] : Object.keys(groups[category] ?? {});
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        Category
        <select
          className={fieldClass}
          value={category}
          onChange={(e) => {
            const next = e.target.value;
            setCategory(next);
            setFrom(next === "temperature" ? "°C" : (Object.keys(groups[next] ?? {})[0] ?? "m"));
            setTo(next === "temperature" ? "°F" : (Object.keys(groups[next] ?? {})[1] ?? "km"));
          }}
        >
          {["length", "weight", "temperature", "speed", "area", "volume", "data"].map((group) => (
            <option key={group}>{group}</option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Value
        <input
          className={fieldClass}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <label className={labelClass}>
        From
        <select className={fieldClass} value={from} onChange={(e) => setFrom(e.target.value)}>
          {units.map((unit) => (
            <option key={unit}>{unit}</option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        To
        <select className={fieldClass} value={to} onChange={(e) => setTo(e.target.value)}>
          {units.map((unit) => (
            <option key={unit}>{unit}</option>
          ))}
        </select>
      </label>
      <p className="text-lg font-semibold sm:col-span-2" aria-live="polite">
        {Number.isFinite(converted)
          ? `${Number(converted.toPrecision(10))} ${to}`
          : "Enter a valid amount."}
      </p>
    </section>
  );
}

function convertTemp(n: number, from: string, to: string) {
  if (from === to) return n;
  const c = from === "°F" ? ((n - 32) * 5) / 9 : from === "K" ? n - 273.15 : n;
  return to === "°F" ? (c * 9) / 5 + 32 : to === "K" ? c + 273.15 : c;
}

function PercentageCalculator() {
  const [mode, setMode] = useState("of");
  const [a, setA] = useState("10");
  const [b, setB] = useState("50");
  const x = Number(a),
    y = Number(b);
  const answer =
    mode === "of"
      ? (x * y) / 100
      : mode === "share"
        ? y === 0
          ? NaN
          : (x / y) * 100
        : y === 0
          ? NaN
          : ((x - y) / y) * 100;
  return (
    <section className="space-y-3">
      <label className={labelClass}>
        Calculation
        <select className={fieldClass} value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="of">X% of Y</option>
          <option value="share">X is what % of Y?</option>
          <option value="change">% change from Y to X</option>
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          X
          <input
            className={fieldClass}
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
        </label>
        <label className={labelClass}>
          {mode === "of" ? "Y (value)" : "Y (starting value)"}
          <input
            className={fieldClass}
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </label>
      </div>
      <p aria-live="polite" className="font-semibold">
        {Number.isFinite(answer)
          ? `${Number(answer.toFixed(6))}${mode === "of" ? "" : "%"}`
          : "Cannot divide by zero."}
      </p>
    </section>
  );
}

function BasicCalculator() {
  const [expression, setExpression] = useState("");
  const [answer, setAnswer] = useState("");
  const calculate = () => {
    try {
      setAnswer(String(parseArithmetic(expression)));
    } catch {
      setAnswer("Invalid expression");
    }
  };
  return (
    <section className="space-y-3">
      <label className={labelClass} htmlFor="calculator-expression">
        Expression
      </label>
      <input
        id="calculator-expression"
        className={fieldClass}
        inputMode="decimal"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") calculate();
        }}
      />
      <div className="grid grid-cols-4 gap-2">
        {[
          "7",
          "8",
          "9",
          "÷",
          "4",
          "5",
          "6",
          "×",
          "1",
          "2",
          "3",
          "−",
          "0",
          ".",
          "(",
          ")",
          "+",
          "-",
          "*",
          "/",
        ].map((key) => (
          <Button
            key={key}
            variant="outline"
            type="button"
            aria-label={`Add ${key}`}
            onClick={() =>
              setExpression((old) => old + ({ "÷": "/", "×": "*", "−": "-" }[key] ?? key))
            }
          >
            {key}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={calculate}>
          Calculate
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setExpression("");
            setAnswer("");
          }}
        >
          Clear
        </Button>
      </div>
      <p aria-live="polite" className="font-mono text-xl">
        {answer}
      </p>
    </section>
  );
}

function parseArithmetic(input: string): number {
  const tokens = input.match(/\d*\.?\d+|[()+\-*/]/g) ?? [];
  if (tokens.join("") !== input.replace(/\s+/g, "")) throw new Error("Invalid");
  let i = 0;
  const primary = (): number => {
    const token = tokens[i++];
    if (token === "-") return -primary();
    if (token === "(") {
      const result = expression();
      if (tokens[i++] !== ")") throw new Error("Invalid");
      return result;
    }
    const value = Number(token);
    if (!Number.isFinite(value)) throw new Error("Invalid");
    return value;
  };
  const term = (): number => {
    let value = primary();
    while (tokens[i] === "*" || tokens[i] === "/") {
      const op = tokens[i++];
      const rhs = primary();
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  };
  const expression = (): number => {
    let value = term();
    while (tokens[i] === "+" || tokens[i] === "-") {
      const op = tokens[i++];
      const rhs = term();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  };
  const result = expression();
  if (i !== tokens.length || !Number.isFinite(result)) throw new Error("Invalid");
  return result;
}

function AgeDateCalculator() {
  const today = new Date().toISOString().slice(0, 10);
  const [mode, setMode] = useState("age");
  const [a, setA] = useState("");
  const [b, setB] = useState(today);
  const [days, setDays] = useState("0");
  let answer = "";
  if (mode === "age" && a) {
    const birth = new Date(`${a}T00:00:00`);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (now.getDate() < birth.getDate()) months--;
    if (months < 0) {
      years--;
      months += 12;
    }
    answer = years < 0 ? "Birth date is in the future." : `${years} years and ${months} months`;
  } else if (mode === "between" && a && b) {
    const difference =
      Math.abs(Date.parse(`${b}T00:00:00`) - Date.parse(`${a}T00:00:00`)) / 86400000;
    answer = Number.isFinite(difference) ? `${Math.round(difference)} days` : "Enter valid dates.";
  } else if (mode === "add" && a) {
    const date = new Date(`${a}T00:00:00`);
    date.setDate(date.getDate() + Number(days));
    answer = date.toISOString().slice(0, 10);
  }
  return (
    <section className="space-y-3">
      <label className={labelClass}>
        Mode
        <select className={fieldClass} value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="age">Age from birthdate</option>
          <option value="between">Days between dates</option>
          <option value="add">Add or subtract days</option>
        </select>
      </label>
      <label className={labelClass}>
        {mode === "age" ? "Birthdate" : mode === "between" ? "First date" : "Start date"}
        <input
          className={fieldClass}
          type="date"
          value={a}
          onChange={(e) => setA(e.target.value)}
        />
      </label>
      {mode === "between" && (
        <label className={labelClass}>
          Second date
          <input
            className={fieldClass}
            type="date"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </label>
      )}
      {mode === "add" && (
        <label className={labelClass}>
          Days to add (negative subtracts)
          <input
            className={fieldClass}
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
      )}
      <p aria-live="polite" className="font-semibold">
        {answer}
      </p>
    </section>
  );
}

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
function formatTime(ms: number) {
  const total = Math.max(0, ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const millis = Math.floor((total % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(2, "0")}`;
}
function humanize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}
