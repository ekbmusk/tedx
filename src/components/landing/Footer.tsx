import { getTranslations } from "next-intl/server";
import { contacts } from "@/config/event";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black py-12 md:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[2fr_1fr_1fr] md:gap-10 md:px-10">
        <div>
          <img
            src="/brand/wordmark.svg"
            alt="TEDxZhenysPark"
            width={1304}
            height={147}
            className="h-7 w-auto md:h-9"
          />
          <p className="mt-3 max-w-sm text-xs uppercase tracking-wider text-[var(--color-fg-muted)] md:text-sm">
            {t("tagline")}
          </p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)] md:text-xs">
            {t("contact")}
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {contacts.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${contacts.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--color-red)]"
                >
                  WhatsApp +{contacts.whatsapp}
                </a>
              </li>
            )}
            {contacts.instagram && (
              <li>
                <a
                  href={`https://instagram.com/${contacts.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--color-red)]"
                >
                  Instagram @{contacts.instagram}
                </a>
              </li>
            )}
          </ul>
        </div>
        <div className="flex flex-col gap-2 text-xs text-[var(--color-fg-muted)]">
          <p>© {year} · {t("rights")}.</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-fg-muted)]/70">
            Built by{" "}
            <a
              href="https://bekarys.me"
              target="_blank"
              rel="noreferrer"
              className="text-white underline decoration-[var(--color-line)] decoration-1 underline-offset-4 transition-colors hover:text-[var(--color-red)] hover:decoration-[var(--color-red)]"
            >
              bekarys.me
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
