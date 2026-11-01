/** Hard off switch: neither browser state nor beta flags can enable checkout. */
export const MONETIZATION_ENABLED = false;

export const COMMUNITY_LABELS: Record<string, string> = {
  en: "Community", es: "Comunidad", fr: "Communauté", de: "Community", pt: "Comunidade", it: "Comunità", nl: "Gemeenschap", ru: "Сообщество", tr: "Topluluk", ar: "المجتمع", hi: "समुदाय", ur: "کمیونٹی", fa: "جامعه", bn: "কমিউনিটি", zh: "社区", ja: "コミュニティ", ko: "커뮤니티", id: "Komunitas", sw: "Jumuiya",
};

export function assertMonetizationEnabled() {
  if (!MONETIZATION_ENABLED) throw new Error("Paid checkout is unavailable during community free access.");
}
/** Launch free-access period. Never describe it as permanent. */
export const FREE_ACCESS_START = "October 13, 2026";
export const FREE_ACCESS_END = "October 13, 2027";
export const FREE_ACCESS_BANNER = `Community free access — free until ${FREE_ACCESS_END}. All current features are free during the launch period. Fair-use limits apply. No credit card required.`;
export const FREE_TRY_LINE = "Try a claim check without an account. Create a free account for 3 reports, 3 fact-checks, and 3 citation scans monthly.";
export const AFTER_FREE_NOTE = "After the one-year free-access period, Pro and Teams pricing will be announced. Existing free accounts will receive advance notice.";
export const IS_FREE_Q = "Is Verfiai free?";
export const IS_FREE_A = `Yes. Verfiai is free until ${FREE_ACCESS_END} under fair-use limits. After the one-year community-access period, Pro and Teams plans will be introduced. Existing users will receive advance notice.`;
export const PRICING_TIERS: [string, string][] = [
  ["Community access", `Free until ${FREE_ACCESS_END}`],
  ["Free account", "3 reports, 3 fact-checks, and 3 citation scans per month"],
  ["Anonymous visitor", "1 free try of each tool"],
  ["Extended access", "Available on request for academic, educator, and high-volume users"],
  ["Pro", "Join waitlist; planned after the free-access period"],
  ["Teams", "Join waitlist; planned after the free-access period"],
];
export const AI_CONSENSUS_NOTE = "Two AI engines review the same retrieved excerpts. If they materially disagree, a third engine reviews the conflicting evidence. AI agreement is one input to confidence, not proof of accuracy.";
