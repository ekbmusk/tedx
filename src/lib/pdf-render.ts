/**
 * Rasterize the first page of a PDF buffer to a PNG buffer.
 * Used to embed an inline preview of the ticket in activation emails so
 * recipients see the visual without opening the PDF attachment.
 *
 * Uses `pdf-to-png-converter` which wraps pdfjs-dist + @napi-rs/canvas
 * internally and handles worker setup + standard fonts. Lazy-imported so
 * a load failure on a serverless cold start doesn't break the email path.
 */
export async function rasterizePdfFirstPage(
  pdfBytes: Uint8Array,
  scale = 2,
): Promise<Buffer> {
  const { pdfToPng } = await import("pdf-to-png-converter");

  const pages = await pdfToPng(Buffer.from(pdfBytes), {
    pagesToProcess: [1],
    viewportScale: scale,
    // Suppress font warnings; the ticket template has all glyphs subset-embedded.
    disableFontFace: true,
    useSystemFonts: false,
  });

  if (!pages.length) {
    throw new Error("pdfToPng returned no pages");
  }
  return pages[0].content as Buffer;
}
