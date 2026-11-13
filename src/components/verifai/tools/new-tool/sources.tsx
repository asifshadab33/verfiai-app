import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NEW_TOOLS } from "@/lib/tools/new-tool-catalog";
import { STOPWORDS, sentences, words, decodeSrtTime, encodeSrtTime, contrastRatio, cronField, requestJson, requestOptionalJson, pretty, type Props } from "./shared";
import { Controls, List, SourceResults } from "./Controls";
import { useServerFn } from "@tanstack/react-start";
import { searchGdeltNews, searchSecFilings } from "@/lib/free-source.functions";
export default function CategoryTool({ slug, locale = "en" }: Props) {
  const definition = NEW_TOOLS.find((tool) => tool.slug === slug);
  const gdeltSearch = useServerFn(searchGdeltNews);
  const secSearch = useServerFn(searchSecFilings);
  const [input, setInput] = useState("");
  const [secondary, setSecondary] = useState("");
  const [tertiary, setTertiary] = useState("");
  const [result, setResult] = useState<ReactNode>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stopwords, setStopwords] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState("en");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStream = useRef<MediaStream | null>(null);
  const downloadUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      cameraStream.current?.getTracks().forEach((track) => track.stop());
      cameraStream.current = null;
      if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
    };
  }, []);

  useEffect(() => {
    if (cameraActive && videoRef.current && cameraStream.current) {
      videoRef.current.srcObject = cameraStream.current;
    }
  }, [cameraActive]);

  const isLauncher = definition?.kind === "launcher";
  const isApi = definition?.kind === "api";
  const wordCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const word of words(input)) {
      if (!stopwords || !STOPWORDS.has(word)) counts.set(word, (counts.get(word) ?? 0) + 1);
    }
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 30);
  }, [input, stopwords]);

  if (!definition) return <p role="alert">This free tool could not be found.</p>;

  const showError = (reason: unknown) =>
    setError(reason instanceof Error ? reason.message : "The operation could not be completed.");
  const setTextResult = (text: string) =>
    setResult(<pre className="whitespace-pre-wrap break-words">{text}</pre>);

  async function run() {
    setResult(null);
    setError("");
    if (downloadUrl.current) {
      URL.revokeObjectURL(downloadUrl.current);
      downloadUrl.current = null;
    }
    setBusy(true);
    try {
      switch (slug) {        case "wikipedia-citations": {
          const page = (await requestJson(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(input.trim().replaceAll(" ", "_"))}`,
          )) as {
            title?: string;
            content_urls?: { desktop?: { page?: string } };
            timestamp?: string;
            extract?: string;
          };
          const url = page.content_urls?.desktop?.page;
          setResult(
            <div>
              <p>{page.extract}</p>
              <p className="mt-3 font-semibold">Basic APA-style citation</p>
              <p>
                {page.title}. (n.d.). <em>Wikipedia</em>. Retrieved{" "}
                {new Date().toLocaleDateString()}
                {url ? (
                  <>
                    {" "}
                    from{" "}
                    <a className="underline" href={url} target="_blank" rel="noreferrer">
                      {url}
                    </a>
                  </>
                ) : (
                  ""
                )}
              </p>
              <p className="mt-2 text-xs">
                Verify the page revision date and citation style requirements before using this
                reference.
              </p>
            </div>,
          );
          break;
        }
        case "wikidata-lookup": {
          const found = (await requestJson(
            `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(input)}&language=en&format=json&origin=*`,
          )) as { search?: { id: string; label: string; description?: string }[] };
          const matches = (found.search ?? []).slice(0, 5);
          if (!matches.length) {
            setResult(<p>No matching Wikidata entities were found.</p>);
            break;
          }
          const entitiesUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${matches.map((item) => item.id).join("|")}&props=labels|descriptions|claims&languages=en&format=json&origin=*`;
          const details = (await requestJson(entitiesUrl)) as {
            entities?: Record<
              string,
              {
                labels?: Record<string, { value?: string }>;
                descriptions?: Record<string, { value?: string }>;
                claims?: Record<string, { mainsnak?: { datavalue?: { value: unknown } } }[]>;
              }
            >;
          };
          const entities = details.entities ?? {};
          const claims = matches.flatMap((item) =>
            Object.entries(entities[item.id]?.claims ?? {})
              .slice(0, 8)
              .map(([property]) => property),
          );
          const uniqueClaims = [...new Set(claims)].slice(0, 40);
          const propertyLabels = uniqueClaims.length
            ? ((await requestJson(
                `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${uniqueClaims.join("|")}&props=labels&languages=en&format=json&origin=*`,
              )) as { entities?: Record<string, { labels?: Record<string, { value?: string }> }> })
            : { entities: {} };
          const facts = matches.map((item) => {
            const entity = entities[item.id];
            const statements = Object.entries(entity?.claims ?? {})
              .slice(0, 8)
              .map(([property, values]) => {
                const label = propertyLabels.entities?.[property]?.labels?.["en"]?.value ?? property;
                const value = values[0]?.mainsnak?.datavalue?.value;
                const shown =
                  typeof value === "string" || typeof value === "number"
                    ? String(value)
                    : value &&
                        typeof value === "object" &&
                        "text" in value &&
                        typeof value.text === "string"
                      ? value.text
                      : value &&
                          typeof value === "object" &&
                          "id" in value &&
                          typeof value.id === "string"
                        ? value.id
                        : pretty(value);
                return `${label}: ${shown}`;
              });
            return `${entity?.labels?.["en"]?.value ?? item.label} (${item.id}) — ${entity?.descriptions?.["en"]?.value ?? item.description ?? "No description"}${statements.length ? `\n  ${statements.join("\n  ")}` : ""}`;
          });
          setTextResult(facts.join("\n\n"));
          break;
        }
        case "open-access-finder": {
          const doi = input
            .trim()
            .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
            .replace(/^doi:\s*/i, "");
          if (!doi) throw new Error("Enter a DOI.");
          const encodedDoi = encodeURIComponent(doi);
          const key = doi.toLowerCase();
          let cached = openAccessCache.get(key);
          if (!cached) {
            cached = Promise.all([
              requestOptionalJson(
                `https://api.openalex.org/works/https://doi.org/${encodedDoi}?mailto=hello@verfiai.app`,
              ) as Promise<{
                best_oa_location?: { landing_page_url?: string; pdf_url?: string };
                open_access?: { is_oa?: boolean };
              }>,
              requestOptionalJson(
                `https://api.unpaywall.org/v2/${encodedDoi}?email=hello@verfiai.app`,
              ) as Promise<{
                is_oa?: boolean;
                best_oa_location?: { landing_page_url?: string; url_for_pdf?: string };
                message?: string;
              }>,
            ]).then(([openAlex, unpaywall]) => ({ openAlex, unpaywall }));
            openAccessCache.set(key, cached);
            void cached.catch(() => {
              if (openAccessCache.get(key) === cached) openAccessCache.delete(key);
            });
            if (openAccessCache.size > 100) {
              const oldestKey = openAccessCache.keys().next().value;
              if (oldestKey) openAccessCache.delete(oldestKey);
            }
          }
          const { openAlex, unpaywall } = await cached;
          const openUrl =
            unpaywall.best_oa_location?.url_for_pdf ??
            unpaywall.best_oa_location?.landing_page_url ??
            openAlex.best_oa_location?.pdf_url ??
            openAlex.best_oa_location?.landing_page_url;
          setResult(
            <div>
              <p>
                Open access reported:{" "}
                {unpaywall.is_oa || openAlex.open_access?.is_oa
                  ? "Yes"
                  : "No copy found by these services"}
                .
              </p>
              {openUrl && (
                <a
                  className="mt-2 inline-block underline"
                  href={openUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open the reported copy
                </a>
              )}
              <p className="mt-2 text-xs">
                A result is not legal advice. Check the repository and license terms.
              </p>
            </div>,
          );
          break;
        }
        case "scholar-search": {
          const key = `verfiai-openalex:${input.trim().toLowerCase()}`;
          type ScholarSearchData = {
            results?: {
              title?: string;
              publication_year?: number;
              doi?: string;
              authorships?: { author?: { display_name?: string } }[];
            }[];
          };
          let cachedData: ScholarSearchData | null = null;
          try {
            const cached = sessionStorage.getItem(key);
            if (cached) cachedData = JSON.parse(cached) as ScholarSearchData;
          } catch {
            cachedData = null;
          }
          const data =
            cachedData ??
            ((await requestJson(
              `https://api.openalex.org/works?search=${encodeURIComponent(input)}&per-page=10&select=title,publication_year,doi,authorships`,
            )) as ScholarSearchData);
          if (!cachedData) {
            try {
              sessionStorage.setItem(key, JSON.stringify(data));
            } catch {
              // Storage is optional; the fetched results remain usable.
            }
          }
          const items = (data.results ?? []).map(
            (work) =>
              `${work.title ?? "Untitled"} (${work.publication_year ?? "date unknown"}) — ${
                work.authorships
                  ?.slice(0, 3)
                  .map((author) => author.author?.display_name)
                  .filter(Boolean)
                  .join(", ") ?? "authors unavailable"
              }${work.doi ? ` — ${work.doi}` : ""}`,
          );
          setResult(<List title="OpenAlex scholarly works" items={items} />);
          break;
        }
        case "europepmc-reader": {
          const data = (await requestJson(
            `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(input)}&format=json&pageSize=10&resultType=core`,
          )) as {
            resultList?: {
              result?: {
                title?: string;
                authorString?: string;
                journalTitle?: string;
                pubYear?: string;
                pmcid?: string;
                doi?: string;
                abstractText?: string;
              }[];
            };
          };
          const works = data.resultList?.result ?? [];
          setResult(
            <ul className="space-y-4">
              {works.map((work) => (
                <li key={work.pmcid ?? work.doi ?? work.title}>
                  <p className="font-semibold">{work.title}</p>
                  <p className="text-sm">
                    {work.authorString} · {work.journalTitle} · {work.pubYear}
                  </p>
                  {work.abstractText && <p className="mt-1 text-sm">{work.abstractText}</p>}
                  {work.pmcid && (
                    <a
                      className="underline"
                      href={`https://europepmc.org/articles/${work.pmcid}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open full text on Europe PMC
                    </a>
                  )}
                </li>
              ))}
            </ul>,
          );
          break;
        }
        case "preprint-finder": {
          const since = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
          const today = new Date().toISOString().slice(0, 10);
          const servers = ["biorxiv", "medrxiv"];
          const collections = await Promise.all(
            servers.map(async (server) => {
              const data = (await requestJson(
                `https://api.biorxiv.org/details/${server}/${since}/${today}/0/json`,
              )) as {
                collection?: {
                  title?: string;
                  authors?: string;
                  date?: string;
                  doi?: string;
                  category?: string;
                }[];
              };
              return (data.collection ?? [])
                .filter((item) =>
                  `${item.title} ${item.authors} ${item.category}`
                    .toLowerCase()
                    .includes(input.toLowerCase()),
                )
                .map(
                  (item) =>
                    `${server}: ${item.title} (${item.date}) — ${item.authors} — https://doi.org/${item.doi}`,
                );
            }),
          );
          setResult(
            <List
              title="Recent matching preprints (last 7 days)"
              items={collections.flat().slice(0, 30)}
            />,
          );
          break;
        }
        case "gdelt-news": {
          setResult(<SourceResults results={await gdeltSearch({ data: { query: input } })} />);
          break;
        }
        case "sec-filings": {
          setResult(<SourceResults results={await secSearch({ data: { query: input } })} />);
          break;
        }
        case "world-bank-data": {
          const country = (input.trim() || "all").toUpperCase();
          const indicator = secondary.trim() || "NY.GDP.MKTP.CD";
          const data = (await requestJson(
            `https://api.worldbank.org/v2/country/${encodeURIComponent(country)}/indicator/${encodeURIComponent(indicator)}?format=json&per_page=20`,
          )) as [unknown, { country?: { value?: string }; date?: string; value?: number | null }[]];
          const rows = Array.isArray(data) ? (data[1] ?? []) : [];
          setResult(
            <List
              title={`World Bank indicator ${indicator}`}
              items={rows.map(
                (row) =>
                  `${row.country?.value ?? country}, ${row.date}: ${row.value ?? "no value"}`,
              )}
            />,
          );
          break;
        }
        default:
          break;
      }
    } catch (reason) {
      showError(reason);
    } finally {
      setBusy(false);
    }
  }

  return <Controls slug={slug} locale={locale} definition={definition} input={input} setInput={setInput} secondary={secondary} setSecondary={setSecondary} tertiary={tertiary} setTertiary={setTertiary} result={result} error={error} busy={busy} stopwords={stopwords} setStopwords={setStopwords} file={file} setFile={setFile} lang={lang} setLang={setLang} cameraActive={cameraActive} setCameraActive={setCameraActive} videoRef={videoRef} cameraStream={cameraStream} showError={showError} run={run} isLauncher={isLauncher} isApi={isApi} />;
}
const openAccessCache = new Map<string, Promise<{
  openAlex: {
    best_oa_location?: { landing_page_url?: string; pdf_url?: string };
    open_access?: { is_oa?: boolean };
  };
  unpaywall: {
    is_oa?: boolean;
    best_oa_location?: { landing_page_url?: string; url_for_pdf?: string };
    message?: string;
  };
}>>();

