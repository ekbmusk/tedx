/**
 * Smoke-test: render a sample PDF, then rasterize page 1 to PNG.
 * Run: npx tsx scripts/test-rasterize.ts
 * Outputs: tmp/ticket-rasterized.png
 */
import fs from "node:fs/promises";
import path from "node:path";
import { generateTicketPdf } from "../src/lib/pdf";
import { rasterizePdfFirstPage } from "../src/lib/pdf-render";

async function main() {
  const out = path.join(process.cwd(), "tmp");
  await fs.mkdir(out, { recursive: true });

  console.log("[1/2] Generating PDF...");
  const pdf = await generateTicketPdf({
    tier: "vip",
    holderName: "Test User",
    orderNo: "VIP-001",
    token: "TESTTOKEN1",
  });
  console.log(`  PDF: ${pdf.byteLength} bytes`);

  console.log("[2/2] Rasterizing first page...");
  const t0 = Date.now();
  const png = await rasterizePdfFirstPage(pdf, 2);
  const elapsed = Date.now() - t0;
  console.log(`  PNG: ${png.byteLength} bytes (${elapsed}ms)`);

  const outFile = path.join(out, "ticket-rasterized.png");
  await fs.writeFile(outFile, png);
  console.log(`✓ ${outFile}`);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
