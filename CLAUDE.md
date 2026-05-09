# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind 4 · next-intl · Supabase (Auth + Postgres + RLS) · pdf-lib for ticket PDFs · html5-qrcode for the scanner.

## Commands

```bash
npm run dev      # next dev (Turbopack)
npm run build
npm run start    # production server

# One-off TS scripts (excluded from tsconfig include, run via tsx):
npx tsx scripts/test-pdf.ts     # render sample PDFs for all 3 tiers → tmp/
npx tsx scripts/probe-pdf.ts    # print template page sizes
npx tsx scripts/probe-font.ts   # check Cyrillic glyph coverage in Inter-Bold

# Supabase migrations (one-time setup, see README):
supabase link --project-ref <ref>
supabase db push
```

There is no lint or test runner configured. `npm run build` is the only correctness gate.

## Architecture

### Two parallel route trees, only one is localized

`src/proxy.ts` is the next-intl middleware (Next 16 renamed `middleware.ts` → `proxy.ts`). Its matcher **deliberately excludes `/admin`, `/t/`, `/api`**, so only the public landing under `src/app/[locale]/` goes through locale routing. With `localePrefix: "as-needed"` and `defaultLocale: "kk"`, the KZ landing lives at `/` and the EN one at `/en`.

The admin and ticket holder flows live outside that tree and pin their UI strings manually: e.g. `src/app/admin/layout.tsx` hardcodes `locale="kk"` for `NextIntlClientProvider`. If you add a new top-level non-localized route, add it to the matcher exclusion in `src/proxy.ts`.

### Ticket lifecycle: `issued → activated → used`

Three actors, three surfaces, one row in `public.tickets`:

1. **Manager** signs in at `/admin/login` and creates a ticket on `/admin/new`. `createTicket` in `src/app/admin/actions.ts` calls the `next_order_no(tier)` RPC to get a per-tier sequence number (`PS-001`, `VIP-001`, `ST-001`) and inserts a row with a 10-char nanoid token (alphabet excludes ambiguous `I L O 0 1`). The manager forwards `https://<site>/t/<token>` to the buyer over WhatsApp.
2. **Buyer** opens `/t/[token]`. First open shows a name form; submit calls `activateTicket` server action → `activate_ticket` RPC, which atomically flips `issued → activated`, stamps `holder_name` via `coalesce` (so re-submits don't overwrite), and sets `activated_at`. Second open shows the QR + the PDF download button.
3. **Volunteer at the door** uses `/admin/scan` (camera, html5-qrcode) → `checkInTicket` server action → `check_in_ticket` RPC. Only `activated` rows transition to `used`; `issued` and `used` rows return their current state and the UI colors the response (green = pass, yellow = already used, red = not activated).

The state machine is enforced inside the SECURITY DEFINER RPCs, not in the action layer — the actions only read the result and shape it for the client.

### Supabase access patterns

`src/lib/supabase/server.ts` exports two clients:

- `createClient()` — SSR cookie-bound client used by every server action and route handler. Subject to RLS. The `tickets` table policy `auth_full_access` allows authenticated managers/scanners to do anything; everything anonymous goes through the SECURITY DEFINER RPCs (`get_ticket_by_token`, `activate_ticket`).
- `createAdminClient()` — `SUPABASE_SECRET_KEY` only, bypasses RLS, no session. Currently unused but kept for server-only operations that must skip RLS.

Public anon traffic only ever calls those two RPCs; `check_in_ticket` and `next_order_no` are revoked from anon and only callable when a manager is signed in. Don't add direct table queries from anon paths — extend the RPC instead.

### PDF generation

Tickets are rendered server-side from `src/assets/ticket-template.pdf`, a single 3-page template where **page index = tier** (`pre-sale=0, vip=1, standard=2`). `src/lib/pdf.ts` opens the template once (cached in module scope), drops the holder name and order number at hardcoded coordinates (`LAYOUT` constants in PDF points, origin bottom-left), composites a generated QR PNG, and returns the bytes. The route handler `src/app/t/[token]/pdf/route.ts` declares `runtime = "nodejs"` (pdf-lib + fs needed) and refuses `issued` tickets and legacy rows missing `tier`/`order_no`.

If you change the template, re-run `npx tsx scripts/probe-pdf.ts` to confirm the page size and adjust `LAYOUT` accordingly. Cyrillic rendering depends on `src/assets/Inter-Bold.otf` registered with `@pdf-lib/fontkit` — `probe-font.ts` is for sanity-checking new glyphs.

### Content lives in code, not in the DB

`src/config/event.ts` is the source of truth for event metadata, tiers, speakers (with bios in both `kk` and `en`), social handles, and the WhatsApp/Telegram CTA builder. UI strings are in `src/messages/{kk,en}.json`. The DB only knows about ticket rows; nothing about the event, speakers, or copy is persisted server-side.

## Environment

Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MANAGER_WHATSAPP` (digits only, no `+`), `NEXT_PUBLIC_MANAGER_TELEGRAM` (username, no `@`).

Optional: `SUPABASE_SECRET_KEY` (only if you need `createAdminClient()`).
