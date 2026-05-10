import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // pdf-to-png-converter pulls in @napi-rs/canvas + pdfjs-dist with native
  // .node bindings; let Next leave them outside the bundle and require()
  // at runtime.
  serverExternalPackages: ["pdf-to-png-converter"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tedturkestan.lovable.app" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default withNextIntl(nextConfig);
