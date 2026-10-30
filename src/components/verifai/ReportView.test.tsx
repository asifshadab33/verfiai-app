import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ensureLocale } from "@/lib/locale-dictionaries";
import type { ResearchReport } from "@/lib/report.functions";

const state = vi.hoisted(() => ({ lang: "en" }));
vi.mock("@tanstack/react-router", () => ({
  useLocation: () => ({ searchStr: `?lang=${state.lang}` }),
  Link: ({ children }: { children: React.ReactNode }) => createElement("a", null, children),
}));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => vi.fn() }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/lib/flags.functions", () => ({ getFeatureFlags: vi.fn() }));
vi.mock("@/lib/payments.functions", () => ({ getSubscription: vi.fn() }));
vi.mock("@/lib/share.functions", () => ({ disableShare: vi.fn(), enableShare: vi.fn(), getShareState: vi.fn() }));
import { ReportView } from "./ReportView";

const report: ResearchReport = {
  title: "Measured fixture", summary: "Summary", background: "Background",
  findings: [], sources: [], analysis: "Analysis", conflictingEvidence: "None",
  methodology: "Method", limitations: "Limitations", conclusion: "Conclusion",
};

describe("report agreement measurement", () => {
  it("omits the panel when no measured state is supplied", () => {
    for (const agreement of [undefined, null]) {
      expect(renderToStaticMarkup(createElement(ReportView, { report, agreement, readOnly: true }))).not.toContain('id="response-agreement-title"');
    }
  });
  it.each(["high", "mixed", "disagreement"] as const)("renders the supplied %s measurement without inferring it", agreement => {
    expect(renderToStaticMarkup(createElement(ReportView, { report, agreement, readOnly: true }))).toContain('id="response-agreement-title"');
  });
  it("retains Arabic report direction for measured output", async () => {
    await ensureLocale("ar"); state.lang = "ar";
    const html = renderToStaticMarkup(createElement(ReportView, { report, agreement: "mixed", readOnly: true }));
    expect(html).toContain('id="report-output" dir="rtl" lang="ar"');
    expect(html).toContain("Mixed Response Agreement");
    state.lang = "en";
  });
});