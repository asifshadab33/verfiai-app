import type { ResearchReport } from "./report-schema";
import { downloadBlob } from "./download-blob";

const STATUS_LABEL: Record<string, string> = {
  sourced: "SOURCED",
  inference: "INFERENCE",
  disputed: "DISPUTED",
  unverified: "UNVERIFIED",
};
const STATUS_COLOR: Record<string, string> = {
  sourced: "1E7B4F",
  inference: "2F4A8A",
  disputed: "B42318",
  unverified: "B54708",
};

export async function downloadDocx(r: ResearchReport, opts: { watermark: boolean }) {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    ExternalHyperlink,
    Footer,
    Header,
    AlignmentType,
    ImageRun,
    HorizontalPositionRelativeFrom,
    VerticalPositionRelativeFrom,
    HorizontalPositionAlign,
    VerticalPositionAlign,
    TextWrappingType,
  } = await import("docx");
  const mark = opts.watermark ? await watermarkPng() : null;
  const paras = (t: string) =>
    (t || "")
      .split(/\n\s*\n/)
      .filter(Boolean)
      .map((p) => new Paragraph({ children: [new TextRun(p.trim())], spacing: { after: 160 } }));
  const h = (text: string) =>
    new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 120 } });
  const badge = r.verification === "web" ? "WEB-VERIFIED" : "MODEL KNOWLEDGE ONLY";
  const children = [
    new Paragraph({ text: r.title, heading: HeadingLevel.TITLE }),
    new Paragraph({
      children: [
        new TextRun({
          text: badge,
          bold: true,
          color: r.verification === "web" ? "1E7B4F" : "B54708",
        }),
        new TextRun({ text: `   ·   ${new Date().toLocaleDateString()}` }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Verfiai provides verification support, not definitive truth judgments. Review sources before relying on a result.",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 240 },
    }),
    h("Executive summary"),
    ...paras(r.summary),
    ...(r.background ? [h("Background"), ...paras(r.background)] : []),
    h("Key findings"),
    ...r.findings.flatMap((f) => [
      new Paragraph({
        children: [
          new TextRun({
            text: `[${STATUS_LABEL[f.status] ?? f.status}] `,
            bold: true,
            color: STATUS_COLOR[f.status] ?? "000000",
          }),
          new TextRun({ text: f.title, bold: true }),
        ],
        heading: HeadingLevel.HEADING_3,
      }),
      ...paras(f.detail),
    ]),
    ...(r.themes?.length
      ? [
          h("Core themes"),
          ...r.themes.flatMap((t) => [
            new Paragraph({ text: t.title, heading: HeadingLevel.HEADING_3 }),
            ...paras(t.summary),
          ]),
        ]
      : []),
    ...(r.analysis
      ? [h(r.format === "dossier" ? "Synthesized chapter" : "Analysis"), ...paras(r.analysis)]
      : []),
    ...(r.proceduralGuidance ? [h("Procedural guidance"), ...paras(r.proceduralGuidance)] : []),
    ...(r.timeline?.length
      ? [
          h("Chronology"),
          ...r.timeline.map(
            (t) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun({ text: `${t.date}: `, bold: true }), new TextRun(t.event)],
              }),
          ),
        ]
      : []),
    ...(r.blindSpots ? [h("Blind spots"), ...paras(r.blindSpots)] : []),
    ...(r.bibliography?.length
      ? [
          h("Annotated bibliography (ranked by source tier)"),
          ...r.bibliography.flatMap((b) => [
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new ExternalHyperlink({
                  link: b.url,
                  children: [new TextRun({ text: b.title, style: "Hyperlink" })],
                }),
                new TextRun(
                  ` — ${b.publisher}${b.date ? `, ${b.date.slice(0, 10)}` : ""} · ${b.tier}`,
                ),
              ],
            }),
            new Paragraph({
              bullet: { level: 1 },
              children: [new TextRun(b.annotation)],
              spacing: { after: 80 },
            }),
            new Paragraph({
              bullet: { level: 1 },
              children: [
                new ExternalHyperlink({
                  link: b.url,
                  children: [new TextRun({ text: b.url, style: "Hyperlink", size: 16 })],
                }),
              ],
              spacing: { after: 120 },
            }),
          ]),
        ]
      : []),
    h("Sources"),
    ...(r.sources.length
      ? r.sources.map(
          (s, i) =>
            new Paragraph({
              children: [
                new TextRun(`[${i + 1}] `),
                new ExternalHyperlink({
                  link: s.url,
                  children: [new TextRun({ text: s.title, style: "Hyperlink" })],
                }),
                new TextRun(` — ${s.publisher}${s.date ? `, ${s.date.slice(0, 10)}` : ""}`),
              ],
              spacing: { after: 100 },
            }),
        )
      : [new Paragraph("No source links were found.")]),
    h("Conflicting evidence"),
    ...paras(r.conflictingEvidence),
    h("Methodology"),
    ...paras(r.methodology),
    h("Limitations"),
    ...paras(r.limitations),
    h("Conclusion"),
    ...paras(r.conclusion),
    ...(r.searchAudit?.length
      ? [
          h("Search audit log"),
          ...r.searchAudit.map(
            (l) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun({ text: l, size: 18 })],
              }),
          ),
        ]
      : []),
    ...(r.engines?.length
      ? [
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated with: ${r.engines.join(" · ")}`,
                size: 16,
                color: "666666",
              }),
            ],
            spacing: { before: 300 },
          }),
        ]
      : []),
  ];
  const footer = opts.watermark
    ? new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Made with Verfiai · verfiai.app", size: 16, color: "888888" }),
            ],
          }),
        ],
      })
    : undefined;
  const header = mark
    ? new Header({
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                type: "png",
                data: mark,
                transformation: { width: 560, height: 560 },
                altText: {
                  title: "Watermark",
                  description: "Generated by Verfiai (Free Tier)",
                  name: "watermark",
                },
                floating: {
                  horizontalPosition: {
                    relative: HorizontalPositionRelativeFrom.PAGE,
                    align: HorizontalPositionAlign.CENTER,
                  },
                  verticalPosition: {
                    relative: VerticalPositionRelativeFrom.PAGE,
                    align: VerticalPositionAlign.CENTER,
                  },
                  behindDocument: true,
                  wrap: { type: TextWrappingType.NONE },
                },
              }),
            ],
          }),
        ],
      })
    : undefined;
  const doc = new Document({
    sections: [
      {
        ...(footer ? { footers: { default: footer } } : {}),
        ...(header ? { headers: { default: header } } : {}),
        children,
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  downloadBlob(
    blob,
    `${
      r.title
        .replace(/[^\w\- ]+/g, "")
        .slice(0, 60)
        .trim() || "verfi-ai-report"
    }.docx`,
  );
}

// Light gray diagonal "Generated by Verfiai (Free Tier)" watermark, drawn in the browser.
async function watermarkPng(): Promise<Uint8Array> {
  const c = document.createElement("canvas");
  c.width = c.height = 1200;
  const g = c.getContext("2d")!;
  g.translate(600, 600);
  g.rotate(-Math.PI / 4);
  g.fillStyle = "rgba(150,150,150,0.22)";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "bold 84px Arial";
  g.fillText("Generated by Verfiai", 0, -50);
  g.font = "bold 64px Arial";
  g.fillText("(Free Tier)", 0, 60);
  const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
  return new Uint8Array(await blob.arrayBuffer());
}
