import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { TIERS, type Tier } from "@/config/event";

/**
 * Generate the ticket as a PNG buffer. Used both as download from the
 * ticket page (`/t/<token>/image`) and as inline + attached image in the
 * activation email.
 *
 * The 3 PDF template pages are pre-rendered to PNG at 300 DPI once
 * (committed under src/assets/templates/) so we don't need pdfjs/pdf-lib
 * at runtime. Holder name + order_no + QR are composited on top using
 * @napi-rs/canvas — same `LAYOUT` math as the old PDF generator, just
 * scaled from PDF points to image pixels.
 */

// Original PDF template was 306.1 × 544.3 pt; we render at 300 DPI = ~4.17 px/pt.
// Templates committed at the resulting size (1276 × 2268 px).
const PT_TO_PX = 300 / 72;
const PAGE_HEIGHT_PT = 544.3;

const TEMPLATE_PATH: Record<Tier, string> = {
  "pre-sale": "src/assets/templates/t-1.png",
  vip: "src/assets/templates/t-2.png",
  standard: "src/assets/templates/t-3.png",
};

/**
 * PDF point coordinates (origin bottom-left), same numbers used by the old
 * pdf-lib LAYOUT. We flip y at draw time.
 */
const LAYOUT = {
  qr: {
    rightMargin: 8,
    bottomY: 84,
    size: 60,
    padding: 2,
  },
  holder: {
    leftMargin: 22,
    bottomFromBottom: 144,
    size: 13,
  },
  order: {
    leftMargin: 50,
    bottomFromBottom: 100,
    size: 13,
  },
};

const TIER_TEXT_COLOR: Record<Tier, string> = {
  "pre-sale": "#000000",
  vip: "#FFFFFF",
  standard: "#FFFFFF",
};

let fontRegistered = false;
let cachedFont: Buffer | null = null;
const cachedTemplateBytes = new Map<Tier, Buffer>();

async function getCanvasMod() {
  return import("@napi-rs/canvas");
}

async function ensureFont() {
  if (fontRegistered) return;
  const { GlobalFonts } = await getCanvasMod();
  if (!cachedFont) {
    cachedFont = await fs.readFile(
      path.join(process.cwd(), "src/assets/Inter-Bold.otf"),
    );
  }
  GlobalFonts.register(cachedFont, "InterBold");
  fontRegistered = true;
}

async function loadTemplate(tier: Tier): Promise<Buffer> {
  if (!cachedTemplateBytes.has(tier)) {
    const bytes = await fs.readFile(
      path.join(process.cwd(), TEMPLATE_PATH[tier]),
    );
    cachedTemplateBytes.set(tier, bytes);
  }
  return cachedTemplateBytes.get(tier)!;
}

export async function generateTicketImage(args: {
  tier: Tier;
  holderName: string;
  orderNo: string;
  token: string;
}): Promise<Buffer> {
  if (!TIERS.includes(args.tier)) {
    throw new Error(`unknown tier: ${args.tier}`);
  }

  const { createCanvas, loadImage } = await getCanvasMod();
  await ensureFont();

  const [templateBytes, qrPngBytes] = await Promise.all([
    loadTemplate(args.tier),
    QRCode.toBuffer(args.token, {
      margin: 0,
      // Scale QR up for sharpness when drawn at LAYOUT.qr.size.
      width: Math.round(LAYOUT.qr.size * PT_TO_PX * 2),
      errorCorrectionLevel: "H",
      color: { dark: "#000000", light: "#FFFFFF" },
    }),
  ]);

  const template = await loadImage(templateBytes);
  const canvas = createCanvas(template.width, template.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(template, 0, 0);

  // PDF point → canvas px, flipping y from bottom-origin to top-origin.
  const pxX = (xPt: number) => xPt * PT_TO_PX;
  const pxYTop = (yPtBottom: number) =>
    (PAGE_HEIGHT_PT - yPtBottom) * PT_TO_PX;

  ctx.fillStyle = TIER_TEXT_COLOR[args.tier];
  ctx.textBaseline = "alphabetic";

  // Holder name
  if (args.holderName) {
    ctx.font = `${LAYOUT.holder.size * PT_TO_PX}px "InterBold"`;
    ctx.fillText(
      args.holderName,
      pxX(LAYOUT.holder.leftMargin),
      pxYTop(LAYOUT.holder.bottomFromBottom),
    );
  }

  // Order number
  ctx.font = `${LAYOUT.order.size * PT_TO_PX}px "InterBold"`;
  ctx.fillText(
    args.orderNo,
    pxX(LAYOUT.order.leftMargin),
    pxYTop(LAYOUT.order.bottomFromBottom),
  );

  // QR with white pad (matches PDF look)
  const qrSizePx = LAYOUT.qr.size * PT_TO_PX;
  const qrPadPx = LAYOUT.qr.padding * PT_TO_PX;
  const qrX = template.width - LAYOUT.qr.rightMargin * PT_TO_PX - qrSizePx;
  const qrYBottom = LAYOUT.qr.bottomY; // PDF y of QR bottom edge
  const qrYTop = pxYTop(qrYBottom + LAYOUT.qr.size); // canvas y of QR top edge

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(
    qrX - qrPadPx,
    qrYTop - qrPadPx,
    qrSizePx + qrPadPx * 2,
    qrSizePx + qrPadPx * 2,
  );

  const qrImg = await loadImage(qrPngBytes);
  ctx.drawImage(qrImg, qrX, qrYTop, qrSizePx, qrSizePx);

  return canvas.toBuffer("image/png");
}
