import { createRequire } from "node:module";

const nodeRequire = createRequire(import.meta.url);

/**
 * Rasterize the first page of a PDF buffer to a PNG buffer.
 * Used to embed an inline preview of the ticket in activation emails so
 * recipients see the visual without opening the PDF attachment.
 *
 * Uses `pdf-to-png-converter` (which wraps pdfjs-dist + @napi-rs/canvas).
 * pdfjs v5 always demands `GlobalWorkerOptions.workerSrc`, even in Node;
 * pdf-to-png-converter does not set it itself, so we resolve the bundled
 * worker file and set it once on the shared singleton.
 */
let workerSrcInitialized = false;

async function ensureWorkerSrc() {
  if (workerSrcInitialized) return;
  const { GlobalWorkerOptions } = await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  );
  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = nodeRequire.resolve(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
    );
  }
  workerSrcInitialized = true;
}

export async function rasterizePdfFirstPage(
  pdfBytes: Uint8Array,
  scale = 2,
): Promise<Buffer> {
  await ensureWorkerSrc();
  const { pdfToPng } = await import("pdf-to-png-converter");

  const pages = await pdfToPng(Buffer.from(pdfBytes), {
    pagesToProcess: [1],
    viewportScale: scale,
    disableFontFace: true,
    useSystemFonts: false,
  });

  if (!pages.length) {
    throw new Error("pdfToPng returned no pages");
  }
  return pages[0].content as Buffer;
}
