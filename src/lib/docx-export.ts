import type { ResearchReport } from "./report-schema";

const STATUS_LABEL: Record<string, string> = { sourced: "SOURCED", inference: "INFERENCE", disputed: "DISPUTED", unverified: "UNVERIFIED" };
const STATUS_COLOR: Record<string, string> = { sourced: "1E7B4F", inference: "2F4A8A", disputed: "B42318", unverified: "B54708" };

export async function downloadDocx(r: ResearchReport, opts: { watermark: boolean }) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink, Footer, AlignmentType } = await import("docx");
  const paras = (t: string) => (t || "").split(/\n\s*\n/).filter(Boolean).map(p => new Paragraph({ children: [new TextRun(p.trim())], spacing: { after: 160 } }));
  const h = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 120 } });
  const badge = r.verification === "web" ? "WEB-VERIFIED" : "MODEL KNOWLEDGE ONLY";
  const children = [
    new Paragraph({ text: r.title, heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: badge, bold: true, color: r.verification === "web" ? "1E7B4F" : "B54708" }), new TextRun({ text: `   ·   ${new Date().toLocaleDateString()}` })], spacing: { after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: "VerifAI provides verification support, not definitive truth judgments. Review sources before relying on a result.", italics: true, size: 18 })], spacing: { after: 240 } }),
    h("Executive summary"), ...paras(r.summary),
    ...(r.background ? [h("Background"), ...paras(r.background)] : []),
    h("Key findings"),
    ...r.findings.flatMap(f => [
      new Paragraph({ children: [new TextRun({ text: `[${STATUS_LABEL[f.status] ?? f.status}] `, bold: true, color: STATUS_COLOR[f.status] ?? "000000" }), new TextRun({ text: f.title, bold: true })], heading: HeadingLevel.HEADING_3 }),
      ...paras(f.detail),
    ]),
    ...(r.analysis ? [h("Analysis"), ...paras(r.analysis)] : []),
    h("Sources"),
    ...(r.sources.length ? r.sources.map((s, i) => new Paragraph({ children: [new TextRun(`[${i + 1}] `), new ExternalHyperlink({ link: s.url, children: [new TextRun({ text: s.title, style: "Hyperlink" })] }), new TextRun(` — ${s.publisher}${s.date ? `, ${s.date.slice(0, 10)}` : ""}`)], spacing: { after: 100 } })) : [new Paragraph("No source links were found.")]),
    h("Conflicting evidence"), ...paras(r.conflictingEvidence),
    h("Methodology"), ...paras(r.methodology),
    h("Limitations"), ...paras(r.limitations),
    h("Conclusion"), ...paras(r.conclusion),
    ...(r.engines?.length ? [new Paragraph({ children: [new TextRun({ text: `Generated with: ${r.engines.join(" · ")}`, size: 16, color: "666666" })], spacing: { before: 300 } })] : []),
  ];
  const footer = opts.watermark ? new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Made with VerifAI · verfiai.app", size: 16, color: "888888" })] })] }) : undefined;
  const doc = new Document({ sections: [{ ...(footer ? { footers: { default: footer } } : {}), children }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${r.title.replace(/[^\w\- ]+/g, "").slice(0, 60).trim() || "verifai-report"}.docx`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
