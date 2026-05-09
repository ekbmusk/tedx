/**
 * Overlay a coordinate grid on the template so we can pick exact pt values
 * for holder/order/QR placement. Run: npx tsx scripts/probe-grid.ts
 */
import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function main() {
  const bytes = await fs.readFile(
    path.join(process.cwd(), "src/assets/ticket-template.pdf"),
  );
  const doc = await PDFDocument.load(bytes);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(doc, [0, 1, 2]);
  for (const p of pages) out.addPage(p);

  const font = await out.embedFont(StandardFonts.Helvetica);

  for (const page of out.getPages()) {
    const { width, height } = page.getSize();
    for (let y = 0; y <= height; y += 10) {
      const isMajor = y % 20 === 0;
      page.drawLine({
        start: { x: 0, y },
        end: { x: width, y },
        thickness: isMajor ? 0.3 : 0.15,
        color: isMajor ? rgb(1, 0, 0) : rgb(1, 0.6, 0.6),
        opacity: 0.5,
      });
      if (isMajor) {
        page.drawText(String(y), { x: 2, y: y + 1, size: 5, font, color: rgb(1, 0, 0) });
        page.drawText(String(y), { x: width - 14, y: y + 1, size: 5, font, color: rgb(1, 0, 0) });
      }
    }
    for (let x = 0; x <= width; x += 10) {
      const isMajor = x % 20 === 0;
      page.drawLine({
        start: { x, y: 0 },
        end: { x, y: height },
        thickness: isMajor ? 0.3 : 0.15,
        color: isMajor ? rgb(0, 0, 1) : rgb(0.6, 0.6, 1),
        opacity: 0.5,
      });
      if (isMajor) {
        page.drawText(String(x), { x: x + 1, y: 2, size: 5, font, color: rgb(0, 0, 1) });
      }
    }
  }

  const outPath = path.join(process.cwd(), "tmp", "template-grid.pdf");
  await fs.writeFile(outPath, await out.save());
  console.log(`✓ ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
