/**
 * Generate sample ticket PNGs for all 3 tiers. Run: npx tsx scripts/test-image.ts
 * Outputs: tmp/ticket-{tier}.png
 */
import fs from "node:fs/promises";
import path from "node:path";
import { generateTicketImage } from "../src/lib/ticket-image";

async function main() {
  const out = path.join(process.cwd(), "tmp");
  await fs.mkdir(out, { recursive: true });

  const samples = [
    { tier: "pre-sale" as const, orderNo: "PS-001", holderName: "Айдана Қалиқызы" },
    { tier: "vip" as const, orderNo: "VIP-001", holderName: "Бекжан Әділбек" },
    { tier: "standard" as const, orderNo: "ST-001", holderName: "Мадина Жұмабаева" },
  ];

  for (const s of samples) {
    const t0 = Date.now();
    const png = await generateTicketImage({
      tier: s.tier,
      holderName: s.holderName,
      orderNo: s.orderNo,
      token: `SAMPLE-${s.orderNo}`,
    });
    const outFile = path.join(out, `ticket-${s.tier}.png`);
    await fs.writeFile(outFile, png);
    console.log(`✓ ${outFile} (${png.byteLength} bytes, ${Date.now() - t0}ms)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
