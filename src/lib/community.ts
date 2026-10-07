/** Hard off switch: neither browser state nor beta flags can enable checkout. */
export const MONETIZATION_ENABLED = false;

export const COMMUNITY_LABELS: Record<string, string> = {
  en: "Community", es: "Comunidad", fr: "Communauté", de: "Community", pt: "Comunidade", it: "Comunità", nl: "Gemeenschap", ru: "Сообщество", tr: "Topluluk", ar: "المجتمع", hi: "समुदाय", ur: "کمیونٹی", fa: "جامعه", bn: "কমিউনিটি", zh: "社区", ja: "コミュニティ", ko: "커뮤니티", id: "Komunitas", sw: "Jumuiya",
};

export function assertMonetizationEnabled() {
  if (!MONETIZATION_ENABLED) throw new Error("Paid checkout is unavailable during community free access.");
}