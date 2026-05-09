import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, type PDFFont, type PDFImage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import { TIERS, type Tier } from "@/config/event";

const TIER_PAGE: Record<Tier, number> = {
  "pre-sale": 0,
  vip: 1,
  standard: 2,
};

/**
 * Layout in PDF points (1pt = 1/72").
 * Origin is the bottom-left of the page.
 * Template page size: 306.1 × 544.3 pt.
 */
const LAYOUT = {
  qr: {
    rightMargin: 8,
    bottomMargin: 4,
    size: 56,
    padding: 6,
  },
  holder: {
    leftMargin: 22,
    bottomFromBottom: 134,
    size: 13,
  },
  order: {
    leftMargin: 47,
    bottomFromBottom: 96,
    size: 13,
  },
};

const TIER_TEXT_COLOR: Record<Tier, [number, number, number]> = {
  "pre-sale": [0, 0, 0],
  vip: [1, 1, 1],
  standard: [1, 1, 1],
};

let cachedTemplate: Uint8Array | null = null;
let cachedFont: Uint8Array | null = null;

async function readTemplate(): Promise<Uint8Array> {
  if (!cachedTemplate) {
    cachedTemplate = await fs.readFile(
      path.join(process.cwd(), "src/assets/ticket-template.pdf"),
    );
  }
  return cachedTemplate;
}

async function readFont(): Promise<Uint8Array> {
  if (!cachedFont) {
    cachedFont = await fs.readFile(
      path.join(process.cwd(), "src/assets/Inter-Bold.otf"),
    );
  }
  return cachedFont;
}

export async function generateTicketPdf(args: {
  tier: Tier;
  holderName: string;
  orderNo: string;
  token: string;
}): Promise<Uint8Array> {
  if (!TIERS.includes(args.tier)) {
    throw new Error(`unknown tier: ${args.tier}`);
  }

  const [templateBytes, fontBytes, qrPngBytes] = await Promise.all([
    readTemplate(),
    readFont(),
    QRCode.toBuffer(args.token, {
      margin: 0,
      width: 600,
      errorCorrectionLevel: "H",
      color: { dark: "#000000", light: "#FFFFFF" },
    }),
  ]);

  const template = await PDFDocument.load(templateBytes);
  const out = await PDFDocument.create();
  out.registerFontkit(fontkit);

  const [page] = await out.copyPages(template, [TIER_PAGE[args.tier]]);
  out.addPage(page);

  const font: PDFFont = await out.embedFont(fontBytes);
  const qrImage: PDFImage = await out.embedPng(qrPngBytes);

  const { width } = page.getSize();

  // ── QR (always on white pad, ensures contrast on VIP/STANDARD) ─────────
  const qrX = width - LAYOUT.qr.rightMargin - LAYOUT.qr.size;
  const qrY = LAYOUT.qr.bottomMargin;
  page.drawRectangle({
    x: qrX - LAYOUT.qr.padding,
    y: qrY - LAYOUT.qr.padding,
    width: LAYOUT.qr.size + LAYOUT.qr.padding * 2,
    height: LAYOUT.qr.size + LAYOUT.qr.padding * 2,
    color: rgb(1, 1, 1),
  });
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: LAYOUT.qr.size,
    height: LAYOUT.qr.size,
  });

  // ── Text fields (HOLDER + Order N°) ────────────────────────────────────
  const [r, g, b] = TIER_TEXT_COLOR[args.tier];
  const textColor = rgb(r, g, b);

  if (args.holderName) {
    page.drawText(args.holderName, {
      x: LAYOUT.holder.leftMargin,
      y: LAYOUT.holder.bottomFromBottom,
      size: LAYOUT.holder.size,
      font,
      color: textColor,
    });
  }

  page.drawText(args.orderNo, {
    x: LAYOUT.order.leftMargin,
    y: LAYOUT.order.bottomFromBottom,
    size: LAYOUT.order.size,
    font,
    color: textColor,
  });

  return out.save();
}
