import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchResources, discoverOpenResearch } from "@/lib/library.functions";

type Kind = "index" | "library";
type Resource = Awaited<ReturnType<typeof searchResources>>[number];
type Discovery = Awaited<ReturnType<typeof discoverOpenResearch>>[number];
export function ResourceBrowse({ kind }: { kind: Kind }) {
  const search = useServerFn(searchResources);
  const discover = useServerFn(discoverOpenResearch);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");
  const [language, setLanguage] = useState("all");
  const [licence, setLicence] = useState("all");
  const [rows, setRows] = useState<Resource[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  useEffect(() => {
    try {
      setBookmarks(JSON.parse(localStorage.getItem("verfiai-resource-bookmarks") || "[]"));
    } catch {
      /* optional */
    }
  }, []);
  function toggleBookmark(id: string) {
    const next = bookmarks.includes(id) ? bookmarks.filter((x) => x !== id) : [...bookmarks, id];
    setBookmarks(next);
    try {
      localStorage.setItem("verfiai-resource-bookmarks", JSON.stringify(next));
    } catch {
      /* optional */
    }
  }
  const [external, setExternal] = useState<Discovery[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setBusy(true);
    search({ data: { query, category, region, kind } })
      .then((data) => {
        if (active) {
          setRows(data);
          setBusy(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("The catalog could not load. Please retry.");
          setBusy(false);
        }
      });
    return () => {
      active = false;
    };
  }, [query, category, region, kind, search]);
  async function lookup() {
    if (query.trim().length < 3) return;
    setBusy(true);
    setError("");
    try {
      setExternal(await discover({ data: { query } }));
    } catch {
      setError("Publisher search is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }
  const visible = rows.filter(
    (item) =>
      (language === "all" || item.language === language) &&
      (licence === "all" ||
        (licence === "known"
          ? !item.licence_name.startsWith("Unknown")
          : item.licence_name.startsWith("Unknown"))),
  );
  const categories = [
    "all",
    "research",
    "academic",
    "news",
    "business",
    "policy",
    "AI verification",
  ];
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-3 size-4 text-muted-foreground" />
          <Input
            aria-label="Search resources"
            placeholder="Search titles, publishers, topics"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setExternal([]);
            }}
            className="h-10 bg-card ps-10 pe-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear search"
              className="absolute end-0 top-0"
              onClick={() => {
                setQuery("");
                setExternal([]);
              }}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        {kind === "index" && (
          <Button variant="outline" disabled={busy || query.trim().length < 3} onClick={lookup}>
            Search publications
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted-foreground">
          Category{" "}
          <select
            aria-label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="ms-2 h-10 rounded border border-input bg-card px-2 text-foreground"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-muted-foreground">
          Region{" "}
          <select
            aria-label="Region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="ms-2 h-10 rounded border border-input bg-card px-2 text-foreground"
          >
            {["all", "Asia", "Europe", "Americas", "Africa", "Middle East", "Global"].map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "All regions" : r}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-muted-foreground">
          Language{" "}
          <select
            aria-label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="ms-2 h-10 rounded border border-input bg-card px-2 text-foreground"
          >
            <option value="all">All languages</option>
            {[...new Set(rows.map((r) => r.language))].map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-muted-foreground">
          Licence{" "}
          <select
            aria-label="Licence"
            value={licence}
            onChange={(e) => setLicence(e.target.value)}
            className="ms-2 h-10 rounded border border-input bg-card px-2 text-foreground"
          >
            <option value="all">All licences</option>
            <option value="known">Licence provided</option>
            <option value="unknown">Check publisher</option>
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <p role="status" className="text-sm text-muted-foreground">
        {busy ? "Searching…" : `${visible.length + external.length} resources shown`}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((item) => (
          <article key={item.id} className="border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase text-brand">
              <span>
                {item.category} · {item.region}
              </span>
              <span>{item.kind === "library" ? "Free preview" : "Publisher link"}</span>
            </div>
            <h2 className="mt-3 font-display text-xl font-bold">
              <Link to="/resources/$slug" params={{ slug: item.slug }} className="hover:text-brand">
                {item.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              {item.publisher} · {item.licence_name} · {item.source_count} sources · Checked{" "}
              {item.verified_at
                ? new Date(item.verified_at).toLocaleDateString()
                : "not yet recorded"}
            </p>
            <Link
              to="/resources/$slug"
              params={{ slug: item.slug }}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand"
            >
              View details <ArrowUpRight className="size-4" />
            </Link>
            <button
              type="button"
              className="ms-4 min-h-11 text-sm text-brand underline"
              aria-label={`${bookmarks.includes(item.id) ? "Remove bookmark for" : "Bookmark"} ${item.title}`}
              onClick={() => toggleBookmark(item.id)}
            >
              {bookmarks.includes(item.id) ? "Saved" : "Save"}
            </button>
          </article>
        ))}
        {external.map((item) => (
          <article key={item.doi} className="border border-border bg-card p-5">
            <span className="text-xs font-semibold uppercase text-brand">
              Publisher metadata · {item.type}
            </span>
            <h2 className="mt-3 font-display text-xl font-bold">{item.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {item.publisher}
              {item.year ? ` · ${item.year}` : ""}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Reuse rights: check publisher
              {item.licenceUrl ? " (licence link provided)" : " (not supplied)"} · Metadata checked{" "}
              {new Date(item.checkedAt).toLocaleDateString()}
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand"
            >
              Open original publication <ArrowUpRight className="size-4" />
            </a>
            {item.licenceUrl && (
              <a
                href={item.licenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ms-4 text-sm text-brand underline"
              >
                Publisher licence
              </a>
            )}
          </article>
        ))}
      </div>
      {!busy && !visible.length && !external.length && (
        <p className="border-y border-border py-8 text-sm text-muted-foreground">
          {kind === "library"
            ? "No reviewed reports are published yet. Browse the open index while the library is being curated."
            : "No curated resources match your filters. Search publisher publications above."}
        </p>
      )}
    </div>
  );
}
