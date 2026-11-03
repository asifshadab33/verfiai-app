import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

type Headline = {
  text: string;
  manipulated: boolean;
  technique?: string;
  explanation: string;
  tool?: string;
  to?: "/tools/headline-analyzer" | "/tools/claim-spotter" | "/tools/numbers-check";
};

const HEADLINES: Headline[] = [
  {
    text: "Fact check: The Moon has a permanently dark side",
    manipulated: true,
    technique: "Clickbait and absolute wording",
    explanation:
      "The familiar claim is misleading: the far side receives sunlight too. “Permanently dark” turns a misconception into an absolute.",
    tool: "Headline Analyzer",
    to: "/tools/headline-analyzer",
  },
  {
    text: "City library adds Sunday hours beginning this summer",
    manipulated: false,
    explanation: "This states a specific, checkable change without overstating what it means.",
  },
  {
    text: "New study proves coffee prevents every case of heart disease",
    manipulated: true,
    technique: "Clickbait and overclaim",
    explanation:
      "“Proves” and “every case” make an exceptionally broad claim that a single study could not establish.",
    tool: "Headline Analyzer",
    to: "/tools/headline-analyzer",
  },
  {
    text: "‘Vaccines rewrite human DNA,’ says the World Health Organization",
    manipulated: true,
    technique: "Fabricated attribution",
    explanation:
      "This practice example invents a quotation and attributes it to an organization. Always check the original statement; no real quote is implied here.",
    tool: "Claim Spotter",
    to: "/tools/claim-spotter",
  },
  {
    text: "Survey of 1,200 adults finds 42% favor the proposed park plan",
    manipulated: false,
    explanation:
      "The headline names a sample size and a specific result without claiming that the sample represents everyone.",
  },
  {
    text: "Local reports rise 200% after incident count climbs from one to three",
    manipulated: true,
    technique: "Misleading statistics",
    explanation:
      "The percentage increase sounds dramatic, but the count changed by only two. The small baseline is essential context.",
    tool: "Numbers-in-News Checker",
    to: "/tools/numbers-check",
  },
  {
    text: "Scientists split evenly on whether Earth is warming",
    manipulated: true,
    technique: "False balance",
    explanation:
      "It asserts an even split without evidence and gives opposing positions equal weight regardless of the evidence behind them.",
    tool: "Claim Spotter",
    to: "/tools/claim-spotter",
  },
  {
    text: "County transit agency reports bus ridership increased 8% last year",
    manipulated: false,
    explanation:
      "This gives a measurable change and identifies the reporting organization; readers can check the underlying figures.",
  },
  {
    text: "School district publishes proposed calendar for public comment",
    manipulated: false,
    explanation:
      "This describes an action and its status without implying an outcome or adding urgency.",
  },
  {
    text: "One unusual result means the new policy is a total failure",
    manipulated: true,
    technique: "Cherry-picking and overgeneralization",
    explanation:
      "One example is treated as proof about an entire policy, while broader results and other evidence are left out.",
    tool: "Claim Spotter",
    to: "/tools/claim-spotter",
  },
];

export function HeadlineQuiz() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [scored, setScored] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const score = HEADLINES.reduce(
    (total, headline, index) => total + (answers[index] === headline.manipulated ? 1 : 0),
    0,
  );

  async function copyResult() {
    const result = `I scored ${score}/${HEADLINES.length} on Verfiai's Spot the Fake Headline quiz. https://verfiai.app/tools/headline-quiz`;
    try {
      await navigator.clipboard.writeText(result);
      setCopyStatus("Result copied to clipboard.");
    } catch {
      setCopyStatus("Could not copy automatically. Select and copy the result below.");
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        The quiz uses a claim from Verfiai&rsquo;s fact-check library alongside invented practice
        headlines. None are quotations from news outlets; the quiz checks framing, not truth.
      </p>
      <ol className="space-y-4">
        {HEADLINES.map((headline, index) => (
          <li key={headline.text} className="rounded-lg border border-border p-4">
            <p className="font-semibold">
              {index + 1}. {headline.text}
            </p>
            <fieldset className="mt-3 flex flex-wrap gap-4" disabled={scored}>
              <legend className="sr-only">Is this headline manipulated?</legend>
              {[
                { value: true, label: "Manipulated framing" },
                { value: false, label: "Fair framing" },
              ].map((option) => (
                <label key={option.label} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`headline-${index}`}
                    checked={answers[index] === option.value}
                    onChange={() =>
                      setAnswers((current) => ({ ...current, [index]: option.value }))
                    }
                    className="accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
            {scored && (
              <div className="mt-3 border-t border-border pt-3 text-sm">
                <p className="font-semibold">
                  {headline.manipulated ? headline.technique : "Fair framing"}
                </p>
                <p className="mt-1 text-muted-foreground">{headline.explanation}</p>
                {headline.tool && headline.to && (
                  <Link to={headline.to} className="mt-2 inline-block text-brand underline">
                    Try {headline.tool}
                  </Link>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
      {!scored ? (
        <Button
          onClick={() => setScored(true)}
          disabled={Object.keys(answers).length !== HEADLINES.length}
        >
          Check my score
        </Button>
      ) : (
        <section className="rounded-lg border border-border p-4" aria-live="polite">
          <h2 className="font-display text-xl font-bold">
            Your score: {score} out of {HEADLINES.length}
          </h2>
          <Button className="mt-3" onClick={copyResult}>
            Copy result
          </Button>
          {copyStatus && (
            <p className="mt-2 text-sm" role="status">
              {copyStatus}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            I scored {score}/{HEADLINES.length} on Verfiai&rsquo;s Spot the Fake Headline quiz.
          </p>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => {
              setAnswers({});
              setScored(false);
              setCopyStatus("");
            }}
          >
            Try again
          </Button>
        </section>
      )}
    </div>
  );
}
