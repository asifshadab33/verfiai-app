import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { mergePdfs, rotatePdf, splitPdf } from "./pdf-tools";

async function pdfFile(pages: number): Promise<File> {
  const pdf = await PDFDocument.create();
  for (let index = 0; index < pages; index++) pdf.addPage();
  return new File([new Uint8Array(await pdf.save())], "example.pdf", { type: "application/pdf" });
}

describe("lazy PDF operations", () => {
  it("merges all input pages", async () => {
    const result = await mergePdfs([await pdfFile(1), await pdfFile(2)]);
    expect((await PDFDocument.load(result)).getPageCount()).toBe(3);
  });
  it("splits selected one-based pages", async () => {
    const result = await splitPdf(await pdfFile(3), [1, 3]);
    expect((await PDFDocument.load(result)).getPageCount()).toBe(2);
  });
  it("rotates every page", async () => {
    const result = await rotatePdf(await pdfFile(2), 90);
    expect((await PDFDocument.load(result)).getPages().map((page) => page.getRotation().angle)).toEqual([90, 90]);
  });
});