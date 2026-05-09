import fontkit from "fontkit";

async function main() {
  const font = fontkit.openSync("src/assets/Inter-Bold.otf");
  console.log("postscriptName:", font.postscriptName);
  console.log("familyName:", font.familyName);
  console.log("numGlyphs:", font.numGlyphs);
  for (const ch of "АБбекжан Әділбек") {
    const cp = ch.codePointAt(0)!;
    console.log(
      `'${ch}' U+${cp.toString(16).toUpperCase().padStart(4, "0")} →`,
      font.hasGlyphForCodePoint(cp) ? "ok" : "MISSING",
    );
  }
}

main();
