export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const merged = await PDFDocument.create();
  for (const file of files) {
    const pdf = await PDFDocument.load(await file.arrayBuffer());
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return await merged.save();
}
export async function splitPdf(file: File, pages: number[]): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const newPdf = await PDFDocument.create();
  const copied = await newPdf.copyPages(
    pdf,
    pages.map((p) => p - 1),
  );
  copied.forEach((p) => newPdf.addPage(p));
  return await newPdf.save();
}
export async function rotatePdf(file: File, deg: number): Promise<Uint8Array> {
  const { PDFDocument, degrees } = await import("pdf-lib");
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  pdf.getPages().forEach((p) => p.setRotation(degrees((p.getRotation().angle + deg) % 360)));
  return await pdf.save();
}
