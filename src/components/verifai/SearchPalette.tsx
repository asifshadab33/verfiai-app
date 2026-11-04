import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { siteText } from "@/lib/site-i18n";
import type { Lang } from "@/lib/translations";

type SearchEntry = {
  url: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
};

const POPULAR = [
  {
    url: "/fact-checker",
    title: "Fact-check a claim",
    description: "Check a claim against sources.",
  },
  {
    url: "/tools/citation-generator",
    title: "Citation generator",
    description: "Create a reference from a DOI.",
  },
  { url: "/research", title: "Research", description: "Explore research reports and sources." },
  {
    url: "/tools/doi-checker",
    title: "DOI & retraction checker",
    description: "Check DOI records for notices.",
  },
];

let indexPromise: Promise<SearchEntry[]> | undefined;

function isSearchEntryArray(value: unknown): value is SearchEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        typeof entry.url === "string" &&
        typeof entry.title === "string" &&
        typeof entry.description === "string" &&
        typeof entry.category === "string" &&
        Array.isArray(entry.keywords) &&
        entry.keywords.every((keyword: unknown) => typeof keyword === "string"),
    )
  );
}

function loadSearchIndex() {
  if (!indexPromise) {
    let cached: string | null = null;
    try {
      cached = sessionStorage.getItem("verfiai-search-index-v1");
    } catch (error) {
      console.warn("Could not read the search index session cache:", error);
    }
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as unknown;
        if (isSearchEntryArray(parsed)) return (indexPromise = Promise.resolve(parsed));
      } catch (error) {
        console.warn("The cached search index could not be parsed:", error);
      }
    }
    indexPromise = fetch("/search-index.json", { headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Search index request failed (${response.status}).`);
        const entries: unknown = await response.json();
        if (!isSearchEntryArray(entries))
          throw new Error("The search index has an invalid format.");
        try {
          sessionStorage.setItem("verfiai-search-index-v1", JSON.stringify(entries));
        } catch (error) {
          console.warn("Could not cache the search index for this session:", error);
        }
        return entries;
      })
      .catch((error: unknown) => {
        indexPromise = undefined;
        throw error;
      });
  }
  return indexPromise!;
}

export function SearchPalette({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [indexLoading, setIndexLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let activeEffect = true;
    if (!entries) setIndexLoading(true);
    loadSearchIndex()
      .then((loaded) => {
        if (activeEffect) {
          setEntries(loaded);
          setLoadError("");
          setIndexLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (activeEffect) {
          console.error("Could not load the site search index:", error);
          setLoadError(siteText(lang, "searchLoadError"));
          setIndexLoading(false);
        }
      });
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      activeEffect = false;
      window.clearTimeout(timer);
    };
  }, [open, lang]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 120);
    return () => window.clearTimeout(timer);
  }, [query]);

  const fuse = useMemo(
    () =>
      entries
        ? new Fuse(entries, {
            includeScore: true,
            threshold: 0.38,
            ignoreLocation: true,
            minMatchCharLength: 2,
            keys: [
              { name: "title", weight: 0.58 },
              { name: "keywords", weight: 0.2 },
              { name: "description", weight: 0.17 },
              { name: "category", weight: 0.05 },
            ],
          })
        : null,
    [entries],
  );
  const results = useMemo(
    () =>
      debouncedQuery && fuse
        ? fuse
            .search(debouncedQuery)
            .slice(0, 10)
            .map((item) => item.item)
        : [],
    [debouncedQuery, fuse],
  );
  const options = debouncedQuery ? results : [];
  const list = options.length ? options : debouncedQuery ? (indexLoading ? [] : POPULAR) : POPULAR;

  function navigate(url: string) {
    const target = new URL(url, window.location.origin);
    if (lang !== "en" && !target.searchParams.has("lang")) target.searchParams.set("lang", lang);
    window.location.assign(`${target.pathname}${target.search}${target.hash}`);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && list.length) {
      event.preventDefault();
      setActive((current) => (current + 1) % list.length);
    } else if (event.key === "ArrowUp" && list.length) {
      event.preventDefault();
      setActive((current) => (current - 1 + list.length) % list.length);
    } else if (event.key === "Enter" && list[active]) {
      event.preventDefault();
      navigate(list[active].url);
    }
  }

  const resultList = (
    <ul id="site-search-results" role="listbox" aria-label={siteText(lang, "searchTitle")}>
      {list.map((entry, index) => (
        <li key={`${entry.url}-${index}`} role="presentation">
          <button
            id={`site-search-option-${index}`}
            type="button"
            role="option"
            aria-selected={active === index}
            onMouseEnter={() => setActive(index)}
            onClick={() => navigate(entry.url)}
            className={`flex min-h-14 w-full flex-col items-start rounded-md px-3 py-2 text-start ${active === index ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}
          >
            <span className="font-semibold">{entry.title}</span>
            <span className="line-clamp-1 text-xs text-muted-foreground">{entry.description}</span>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="min-h-11 min-w-11"
        aria-label={siteText(lang, "searchOpen")}
        onClick={() => {
          setOpen(true);
          setActive(0);
        }}
      >
        <Search aria-hidden="true" />
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
            setActive(0);
          }
        }}
      >
        <DialogContent
          closeLabel={siteText(lang, "searchClose")}
          aria-describedby="site-search-description"
          className="top-[15vh] max-h-[75vh] max-w-2xl translate-y-0 overflow-hidden p-0"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogTitle className="sr-only">{siteText(lang, "searchTitle")}</DialogTitle>
          <DialogDescription id="site-search-description" className="sr-only">
            {siteText(lang, "searchHelp")}
          </DialogDescription>
          <div className="flex items-center gap-3 border-b border-border px-4 pe-12">
            <Search aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls="site-search-results"
              aria-activedescendant={list[active] ? `site-search-option-${active}` : undefined}
              placeholder={siteText(lang, "searchPlaceholder")}
              className="min-h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">
              Esc
            </kbd>
          </div>
          <div className="max-h-[55vh] overflow-y-auto p-2">
            {loadError ? (
              <p role="alert" className="p-4 text-sm text-destructive">
                {loadError}
              </p>
            ) : (
              <>
                <p aria-live="polite" className="px-3 py-2 text-xs text-muted-foreground">
                  {debouncedQuery
                    ? `${results.length} ${siteText(lang, "searchResults")}`
                    : siteText(lang, "searchPopular")}
                </p>
                {!debouncedQuery && <p className="sr-only">{siteText(lang, "searchPopular")}</p>}
                {debouncedQuery && indexLoading ? (
                  <p className="px-3 py-5 text-sm text-muted-foreground">
                    {siteText(lang, "searchLoading")}
                  </p>
                ) : debouncedQuery && results.length === 0 ? (
                  <>
                    <p className="px-3 py-5 text-sm text-muted-foreground">
                      {siteText(lang, "searchEmpty")}
                    </p>
                    <p className="px-3 pb-2 text-xs text-muted-foreground">
                      {siteText(lang, "searchPopular")}
                    </p>
                    {resultList}
                  </>
                ) : (
                  resultList
                )}
              </>
            )}
          </div>
          <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            {siteText(lang, "searchKeyboard")}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
