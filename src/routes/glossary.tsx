import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ContentPage } from "@/components/verifai/ContentPage";

const GLOSSARY = [
  {
    category: "Evidence and sourcing",
    terms: [
      {
        term: "Astroturfing",
        definition:
          "A campaign that makes coordinated promotion look like spontaneous support from ordinary people. Check who is behind a message and whether its sources are independent.",
        tool: "Source Evaluation Checklist",
        to: "/tools/source-checklist",
      },
      {
        term: "Bare assertion",
        definition:
          "A claim presented without evidence or reasoning to support it. Use the Claim Spotter to find checkable statements that may need sourcing.",
        tool: "Claim Spotter",
        to: "/tools/claim-spotter",
      },
      {
        term: "Cherry-picking",
        definition:
          "Selecting only the evidence that supports a preferred conclusion while leaving out relevant contrary evidence. Compare the full set of data and sources, not just the examples shown.",
        tool: "Claim Evidence Matrix",
        to: "/tools/evidence-matrix",
      },
      {
        term: "Fabricated attribution",
        definition:
          "A statement is falsely assigned to a person or organization, or a source is invented. Verify quotations against the original publication or recording.",
        tool: "Claim Spotter",
        to: "/tools/claim-spotter",
      },
    ],
  },
  {
    category: "Reasoning and argument",
    terms: [
      {
        term: "False dilemma",
        definition:
          "Presenting two choices as the only possibilities when other options or combinations exist. Ask what alternatives have been left out.",
        tool: "Logical Fallacy Spotter",
        to: "/tools/fallacy-spotter",
      },
      {
        term: "False balance",
        definition:
          "Giving two positions equal weight even when the amount or quality of evidence for them is very different. Look at the evidence and expert consensus, not just the number of voices.",
        tool: "Claim Spotter",
        to: "/tools/claim-spotter",
      },
      {
        term: "Gish gallop",
        definition:
          "Overwhelming a discussion with many claims in quick succession, making each difficult to check. Break the argument into individual claims and assess them one at a time.",
        tool: "Logical Fallacy Spotter",
        to: "/tools/fallacy-spotter",
      },
      {
        term: "Motivated reasoning",
        definition:
          "The tendency to evaluate evidence in ways that favor a conclusion we already want to believe. Try stating what evidence would change your mind before reviewing the sources.",
      },
      {
        term: "Survivorship bias",
        definition:
          "Drawing conclusions from the people or cases that remain visible while overlooking those that failed, disappeared or were never counted. Ask what is missing from the sample.",
      },
    ],
  },
  {
    category: "Language and presentation",
    terms: [
      {
        term: "Clickbait",
        definition:
          "A headline designed to provoke curiosity or emotion, often by exaggerating or withholding key context. Compare the headline with what the article actually establishes.",
        tool: "Headline Analyzer",
        to: "/tools/headline-analyzer",
      },
      {
        term: "Hedging",
        definition:
          "Language that qualifies how certain a statement is, such as “may” or “appears to.” It can accurately signal uncertainty, but vague hedges can also make a claim hard to assess.",
        tool: "Passive Voice & Hedge Detector",
        to: "/tools/passive-hedge",
      },
      {
        term: "Misleading statistics",
        definition:
          "Numbers presented without important context such as a baseline, sample size, time period or denominator. The Numbers-in-News Checker can flag some numerical patterns to examine.",
        tool: "Numbers-in-News Checker",
        to: "/tools/numbers-check",
      },
      {
        term: "Weasel words",
        definition:
          "Vague terms such as “experts say” or “many believe” that imply support without identifying who or how many. Ask for a named source and specific evidence.",
        tool: "Weasel Word Detector",
        to: "/tools/weasel-words",
      },
    ],
  },
];

export const Route = createFileRoute("/glossary")({
  head: () => ({
    meta: [
      { title: "Misinformation glossary | Verfiai" },
      {
        name: "description",
        content:
          "Plain-language definitions of misinformation, evidence and reasoning terms, with links to related free tools.",
      },
      { property: "og:title", content: "Misinformation glossary | Verfiai" },
      {
        property: "og:description",
        content: "Understand common misinformation and reasoning terms.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://verfiai.app/glossary" }],
  }),
  component: Glossary,
});

function Glossary() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const categories = GLOSSARY.map((category) => ({
    ...category,
    terms: category.terms
      .filter(
        ({ term, definition }) =>
          !normalizedQuery ||
          `${term} ${definition}`.toLocaleLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) => a.term.localeCompare(b.term)),
  })).filter((category) => category.terms.length > 0);

  return (
    <ContentPage
      title="Misinformation glossary"
      intro="Plain-language explanations of terms used when checking claims, sources and reasoning."
    >
      <label htmlFor="glossary-search" className="block font-semibold">
        Search terms
      </label>
      <input
        id="glossary-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search the glossary"
        className="mt-2 w-full max-w-xl rounded-md border border-input bg-background px-3 py-2"
      />
      {categories.length ? (
        <div className="mt-8 space-y-10">
          {categories.map((category) => (
            <section key={category.category} aria-label={category.category}>
              <h2 className="font-display text-xl font-bold">{category.category}</h2>
              <dl className="mt-4 divide-y divide-border">
                {category.terms.map(({ term, definition, tool, to }) => (
                  <div key={term} className="grid gap-1 py-4 sm:grid-cols-[minmax(12rem,1fr)_2fr]">
                    <dt className="font-semibold">{term}</dt>
                    <dd className="text-muted-foreground">
                      {definition}
                      {tool && to && (
                        <>
                          {" "}
                          <Link to={to} className="text-brand underline">
                            Try {tool}
                          </Link>
                          .
                        </>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-muted-foreground" aria-live="polite">
          No glossary terms match “{query}”.
        </p>
      )}
    </ContentPage>
  );
}
