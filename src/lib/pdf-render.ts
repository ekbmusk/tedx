import "server-only";

/**
 * Rasterize the first page of a PDF buffer to a PNG buffer.
 * Used to embed an inline preview of the ticket in activation emails so
 * recipients see the visual without opening the PDF attachment.
 *
 * Implementation: pdfjs-dist for PDF parsing/rendering + @napi-rs/canvas
 * for the offscreen canvas (Rust prebuilds for Vercel's linux-x64 runtime
 * and macOS dev). Lazy-imports both libs so a stale or failing module
 * load doesn't break the rest of the email path.
 */
export async function rasterizePdfFirstPage(
  pdfBytes: Uint8Array,
  scale = 2,
): Promise<Buffer> {
  const [{ getDocument, GlobalWorkerOptions }, canvasMod] = await Promise.all([
    // legacy build is the recommended entry for Node — no worker required.
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("@napi-rs/canvas"),
  ]);
  // pdfjs in Node doesn't need a worker; explicitly disable.
  GlobalWorkerOptions.workerSrc = "";

  // pdfjs wants ArrayBuffer-ish input. Copy to fresh Uint8Array to detach
  // from any pooled buffer the caller may pass.
  const data = new Uint8Array(pdfBytes);
  const doc = await getDocument({ data, useSystemFonts: false }).promise;
  try {
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = canvasMod.createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height),
    );
    const ctx = canvas.getContext("2d");
    // Mozilla's render call expects a CanvasRenderingContext2D-shaped object;
    // @napi-rs/canvas is API-compatible.
    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    }).promise;
    return canvas.toBuffer("image/png");
  } finally {
    await doc.cleanup();
    await doc.destroy();
  }
}
