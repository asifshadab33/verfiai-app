import type { Lang } from "../translations";
import { languages } from "../translations";
import { siteText } from "../site-i18n";

export type LangCode = Lang;
export interface Translation {
  name: string;
  dir: "ltr" | "rtl";
  hero_headline: string;
  hero_sub: string;
  cta_primary: string;
  cta_secondary: string;
  start_research: string;
  task_type: string;
  research_question: string;
  placeholder_question: string;
  report_language: string;
  speak_request: string;
  attachment: string;
  show_advanced: string;
  hide_advanced: string;
  generate_report: string;
  disclaimer: string;
  pricing: string;
  free_plan: string;
  pro_plan: string;
  per_month: string;
}

// These fields are shared by the homepage and report workspace; the full
// content dictionaries remain the source for all other page copy.
const extras: Record<LangCode, { speak_request: string; hide_advanced: string; attachment: string }> = {
  en: { speak_request: "Speak your request", hide_advanced: "Hide Advanced Options", attachment: "Attachment (Optional)" },
  es: { speak_request: "Dicta tu solicitud", hide_advanced: "Ocultar opciones avanzadas", attachment: "Archivo adjunto (Opcional)" },
  fr: { speak_request: "Dictez votre demande", hide_advanced: "Masquer les options avancées", attachment: "Pièce jointe (facultative)" },
  de: { speak_request: "Anfrage diktieren", hide_advanced: "Erweiterte Optionen ausblenden", attachment: "Anhang (optional)" },
  pt: { speak_request: "Dite sua solicitação", hide_advanced: "Ocultar opções avançadas", attachment: "Anexo (opcional)" },
  it: { speak_request: "Detta la tua richiesta", hide_advanced: "Nascondi opzioni avanzate", attachment: "Allegato (facoltativo)" },
  nl: { speak_request: "Spreek je verzoek in", hide_advanced: "Geavanceerde opties verbergen", attachment: "Bijlage (optioneel)" },
  ru: { speak_request: "Продиктуйте запрос", hide_advanced: "Скрыть дополнительные параметры", attachment: "Вложение (необязательно)" },
  tr: { speak_request: "İsteğinizi seslendirin", hide_advanced: "Gelişmiş seçenekleri gizle", attachment: "Ek (isteğe bağlı)" },
  ar: { speak_request: "تحدث بطلبك", hide_advanced: "إخفاء الخيارات المتقدمة", attachment: "مرفق (اختياري)" },
  hi: { speak_request: "अपना अनुरोध बोलें", hide_advanced: "उन्नत विकल्प छुपाएं", attachment: "संलग्नक (वैकल्पिक)" },
  bn: { speak_request: "আপনার অনুরোধ বলুন", hide_advanced: "উন্নত বিকল্প লুকান", attachment: "সংযুক্তি (ঐচ্ছিক)" },
  ur: { speak_request: "اپنی درخواست بولیں", hide_advanced: "اعلیٰ اختیارات چھپائیں", attachment: "منسلک (اختیاری)" },
  fa: { speak_request: "درخواست خود را دیکته کنید", hide_advanced: "مخفی کردن گزینه‌های پیشرفته", attachment: "پیوست (اختیاری)" },
  zh: { speak_request: "说出您的请求", hide_advanced: "隐藏高级选项", attachment: "附件（可选）" },
  ja: { speak_request: "音声でリクエスト", hide_advanced: "詳細オプションを非表示", attachment: "添付ファイル（任意）" },
  ko: { speak_request: "요청을 음성으로 입력", hide_advanced: "고급 옵션 숨기기", attachment: "첨부 파일 (선택 사항)" },
  id: { speak_request: "Ucapkan permintaan Anda", hide_advanced: "Sembunyikan opsi lanjutan", attachment: "Lampiran (opsional)" },
  sw: { speak_request: "Sema ombi lako", hide_advanced: "Ficha chaguo za juu", attachment: "Kiambatisho (si lazima)" },
};

export const translations: Record<LangCode, Translation> = Object.fromEntries(languages.map(({code, name}) => [code, {
  name,
  dir: code === "ar" || code === "ur" || code === "fa" ? "rtl" : "ltr",
  hero_headline: siteText(code, "heroTitle"),
  hero_sub: siteText(code, "heroBody"),
  cta_primary: siteText(code, "heroPrimary"),
  cta_secondary: siteText(code, "heroSecondary"),
  start_research: siteText(code, "formTitle"),
  task_type: siteText(code, "formTask"),
  research_question: siteText(code, "promptLabel"),
  placeholder_question: siteText(code, "promptPlaceholder"),
  report_language: siteText(code, "language"),
  ...extras[code],
  show_advanced: siteText(code, "advanced"),
  generate_report: siteText(code, "generate"),
  disclaimer: siteText(code, "verifyDisclaimer"),
  pricing: siteText(code, "navPricing"),
  free_plan: siteText(code, "free"),
  pro_plan: siteText(code, "pro"),
  per_month: siteText(code, "priceMonthly"),
}])) as Record<LangCode, Translation>;
