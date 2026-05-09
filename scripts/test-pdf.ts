/**
 * Generate sample PDFs for all 3 tiers without hitting Supabase.
 * Run: npx tsx scripts/test-pdf.ts
 * Outputs: tmp/ticket-{tier}.pdf
 */
import fs from "node:fs/promises";
import path from "node:path";
import { generateTicketPdf } from "../src/lib/pdf";

async function main() {
  const out = path.join(process.cwd(), "tmp");
  await fs.mkdir(out, { recursive: true });

  const samples = [
    { tier: "pre-sale" as const, orderNo: "PS-001", holderName: "Айдана Қалиқызы" },
    { tier: "vip" as const, orderNo: "VIP-001", holderName: "Бекжан Әділбек" },
    { tier: "standard" as const, orderNo: "ST-001", holderName: "Мадина Жұмабаева" },
  ];

  for (const s of samples) {
    const pdf = await generateTicketPdf({
      tier: s.tier,
      holderName: s.holderName,
      orderNo: s.orderNo,
      token: `SAMPLE-${s.orderNo}`,
    });
    const outFile = path.join(out, `ticket-${s.tier}.pdf`);
    await fs.writeFile(outFile, pdf);
    console.log(`✓ ${outFile} (${pdf.byteLength} bytes)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
