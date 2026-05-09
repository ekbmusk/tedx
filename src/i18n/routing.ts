import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["kk", "en"],
  defaultLocale: "kk",
  localePrefix: "as-needed",
});
