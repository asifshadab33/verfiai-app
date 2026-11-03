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
const extras: Record<
  LangCode,
  { speak_request: string; hide_advanced: string; attachment: string }
> = {
  en: {
    speak_request: "Speak your request",
    hide_advanced: "Hide Advanced Options",
    attachment: "Attachment (Optional)",
  },
  es: {
    speak_request: "Dicta tu solicitud",
    hide_advanced: "Ocultar opciones avanzadas",
    attachment: "Archivo adjunto (Opcional)",
  },
  fr: {
    speak_request: "Dictez votre demande",
    hide_advanced: "Masquer les options avancées",
    attachment: "Pièce jointe (facultative)",
  },
  de: {
    speak_request: "Anfrage diktieren",
    hide_advanced: "Erweiterte Optionen ausblenden",
    attachment: "Anhang (optional)",
  },
  pt: {
    speak_request: "Dite sua solicitação",
    hide_advanced: "Ocultar opções avançadas",
    attachment: "Anexo (opcional)",
  },
  it: {
    speak_request: "Detta la tua richiesta",
    hide_advanced: "Nascondi opzioni avanzate",
    attachment: "Allegato (facoltativo)",
  },
  nl: {
    speak_request: "Spreek je verzoek in",
    hide_advanced: "Geavanceerde opties verbergen",
    attachment: "Bijlage (optioneel)",
  },
  ru: {
    speak_request: "Продиктуйте запрос",
    hide_advanced: "Скрыть дополнительные параметры",
    attachment: "Вложение (необязательно)",
  },
  tr: {
    speak_request: "İsteğinizi seslendirin",
    hide_advanced: "Gelişmiş seçenekleri gizle",
    attachment: "Ek (isteğe bağlı)",
  },
  ar: {
    speak_request: "تحدث بطلبك",
    hide_advanced: "إخفاء الخيارات المتقدمة",
    attachment: "مرفق (اختياري)",
  },
  hi: {
    speak_request: "अपना अनुरोध बोलें",
    hide_advanced: "उन्नत विकल्प छुपाएं",
    attachment: "संलग्नक (वैकल्पिक)",
  },
  bn: {
    speak_request: "আপনার অনুরোধ বলুন",
    hide_advanced: "উন্নত বিকল্প লুকান",
    attachment: "সংযুক্তি (ঐচ্ছিক)",
  },
  ur: {
    speak_request: "اپنی درخواست بولیں",
    hide_advanced: "اعلیٰ اختیارات چھپائیں",
    attachment: "منسلک (اختیاری)",
  },
  fa: {
    speak_request: "درخواست خود را دیکته کنید",
    hide_advanced: "مخفی کردن گزینه‌های پیشرفته",
    attachment: "پیوست (اختیاری)",
  },
  zh: { speak_request: "说出您的请求", hide_advanced: "隐藏高级选项", attachment: "附件（可选）" },
  ja: {
    speak_request: "音声でリクエスト",
    hide_advanced: "詳細オプションを非表示",
    attachment: "添付ファイル（任意）",
  },
  ko: {
    speak_request: "요청을 음성으로 입력",
    hide_advanced: "고급 옵션 숨기기",
    attachment: "첨부 파일 (선택 사항)",
  },
  id: {
    speak_request: "Ucapkan permintaan Anda",
    hide_advanced: "Sembunyikan opsi lanjutan",
    attachment: "Lampiran (opsional)",
  },
  sw: {
    speak_request: "Sema ombi lako",
    hide_advanced: "Ficha chaguo za juu",
    attachment: "Kiambatisho (si lazima)",
  },
};

// Copy supplied for the six locales in the brief. Other locales reuse the
// equivalent, already translated copy from the complete site dictionaries.
const supplied: Partial<Record<LangCode, Partial<Translation>>> = {
  en: {
    hero_headline: "Research you can verify. Reports you can trust.",
    hero_sub:
      "Check claims, explore evidence and turn questions or documents into clear, source-linked research reports.",
    cta_primary: "Try Verfiai free",
    research_question: "Research Question or Claim",
    disclaimer:
      "Verfiai provides verification support, not definitive truth judgments. Review sources before relying on a result.",
    free_plan: "Free",
    pro_plan: "Pro",
    per_month: "per month",
  },
  es: {
    hero_headline: "Investigación que puedes verificar. Informes en los que puedes confiar.",
    hero_sub:
      "Verifica afirmaciones, explora evidencia y convierte preguntas en informes de investigación claros con fuentes.",
    cta_primary: "Prueba Verfiai gratis",
    disclaimer:
      "Verfiai proporciona apoyo de verificación, no juicios definitivos de verdad. Revisa las fuentes antes de confiar en un resultado.",
    free_plan: "Gratis",
    pro_plan: "Pro",
    per_month: "al mes",
  },
  ar: {
    hero_headline: "بحث يمكنك التحقق منه. تقارير يمكنك الوثوق بها.",
    hero_sub:
      "تحقق من الادعاءات، واستكشف الأدلة، وحوّل الأسئلة أو المستندات إلى تقارير بحثية واضحة مرتبطة بالمصادر.",
    cta_primary: "جرّب Verfiai مجانًا",
    disclaimer:
      "يوفر Verfiai دعم التحقق، وليس أحكامًا قاطعة بالحقيقة. راجع المصادر قبل الاعتماد على النتيجة.",
    free_plan: "مجاني",
    pro_plan: "احترافي",
    per_month: "شهريًا",
  },
  hi: {
    hero_headline: "ऐसा शोध जिसे आप सत्यापित कर सकें। ऐसी रिपोर्टें जिन पर आप भरोसा कर सकें।",
    hero_sub:
      "दावों की जाँच करें, साक्ष्य खोजें और सवालों या दस्तावेज़ों को स्पष्ट, स्रोत-सहित शोध रिपोर्टों में बदलें।",
    cta_primary: "Verfiai मुफ़्त आज़माएं",
    disclaimer:
      "Verfiai सत्यापन सहायता प्रदान करता है, निश्चित सत्य निर्णय नहीं। परिणाम पर भरोसा करने से पहले स्रोतों की समीक्षा करें।",
    free_plan: "मुफ़्त",
    pro_plan: "प्रो",
    per_month: "प्रति माह",
  },
  ur: {
    hero_headline: "تحقیق جس کی آپ تصدیق کر سکتے ہیں۔ رپورٹس جن پر آپ بھروسہ کر سکتے ہیں۔",
    hero_sub:
      "دعووں کی جانچ کریں، ثبوت تلاش کریں اور سوالات یا دستاویزات کو واضح، ماخذ سے منسلک تحقیقی رپورٹس میں تبدیل کریں۔",
    cta_primary: "Verfiai مفت آزمائیں",
    start_research: "اپنی تحقیق شروع کریں",
    disclaimer:
      "Verfiai تصدیقی سپورٹ فراہم کرتا ہے، حتمی سچائی کے فیصلے نہیں۔ کسی نتیجے پر بھروسہ کرنے سے پہلے ماخذ کا جائزہ لیں۔",
    free_plan: "مفت",
    pro_plan: "پرو",
    per_month: "فی ماہ",
  },
  fa: {
    hero_headline: "پژوهشی که می‌توانید تأیید کنید. گزارش‌هایی که می‌توانید به آن‌ها اعتماد کنید.",
    hero_sub:
      "ادعاها را بررسی کنید، شواهد را کاوش کنید و سوالات یا اسناد را به گزارش‌های پژوهشی واضح و متصل به منبع تبدیل کنید.",
    cta_primary: "Verfiai را رایگان امتحان کنید",
    disclaimer:
      "Verfiai پشتیبانی تأیید را ارائه می‌دهد، نه قضاوت‌های قطعی حقیقت. قبل از اعتماد به یک نتیجه، منابع را بررسی کنید.",
    free_plan: "رایگان",
    pro_plan: "حرفه‌ای",
    per_month: "در ماه",
  },
};

function interfaceTranslation(code: LangCode): Translation {
  const name = languages.find((language) => language.code === code)?.name ?? code;
  return {
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
    ...supplied[code],
  };
}
// Resolve on access, after the root locale boundary has loaded the requested dictionary.
export const translations = Object.defineProperties(
  {},
  Object.fromEntries(
    languages.map(({ code }) => [
      code,
      {
        enumerable: true,
        get: () => interfaceTranslation(code),
      },
    ]),
  ),
) as Record<LangCode, Translation>;
