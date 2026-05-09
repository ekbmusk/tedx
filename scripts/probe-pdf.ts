import { PDFDocument } from "pdf-lib";
import fs from "node:fs/promises";

async function main() {
  const bytes = await fs.readFile("src/assets/ticket-template.pdf");
  const doc = await PDFDocument.load(bytes);
  doc.getPages().forEach((p, i) => {
    const { width, height } = p.getSize();
    console.log(`page ${i}: ${width.toFixed(1)} × ${height.toFixed(1)} pt`);
  });
}

main();
