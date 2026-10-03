import type { ResourceItem } from '@/data/freeResources';

// Generate real document formats locally; placeholder content is explicitly illustrative.
export async function downloadResource(resource: ResourceItem) {
  const title = resource.title;
  const notice = 'SYNTHETIC ILLUSTRATIVE TEMPLATE — not a verified finding or legal advice.';
  let blob: Blob;
  if (resource.format === 'PDF') {
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([612, 792]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const draw = (text: string, y: number, size = 11, weight = font) => page.drawText(text.replace(/[^\x20-\x7e]/g, '-'), { x: 48, y, size, font: weight, color: rgb(0.12, 0.19, 0.23), maxWidth: 510 });
    draw('VERFIAI  /  RESEARCH RESOURCES', 740, 10, bold);
    draw(title, 700, 16, bold);
    draw(notice, 665, 10);
    resource.sampleContent.forEach((line, i) => { draw(`${i + 1}. ${line}`, 620 - i * 52); page.drawLine({ start: { x: 48, y: 604 - i * 52 }, end: { x: 555, y: 604 - i * 52 }, thickness: 0.5 }); });
    blob = new Blob([new Uint8Array(await pdf.save())], { type: 'application/pdf' });
  } else if (resource.format === 'DOCX') {
    const { Document, Packer, Paragraph, HeadingLevel } = await import('docx');
    const doc = new Document({ sections: [{ children: [new Paragraph({ text: title, heading: HeadingLevel.TITLE }), new Paragraph(notice), ...resource.sampleContent.map(line => new Paragraph({ text: line, spacing: { before: 250, after: 250 } }))] }] });
    blob = await Packer.toBlob(doc);
  } else {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Verification log');
    sheet.addRow(resource.sampleContent);
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { wrapText: true };
    sheet.columns.forEach((column: { width?: number }) => { column.width = 27; });
    sheet.addRow(resource.sampleContent.map(() => ''));
    const bytes = await workbook.xlsx.writeBuffer();
    blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `verfiai-${resource.id}.${resource.format.toLowerCase()}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
