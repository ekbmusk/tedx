# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind 4 · next-intl · Supabase (Auth + Postgres + RLS) · `@napi-rs/canvas` for ticket image generation · `qrcode` for QR · `resend` for transactional email · `html5-qrcode` for the door scanner. Vercel Analytics + Speed Insights mounted in the root layout.

## Commands

```bash
npm run dev      # next dev (Turbopack)
npm run build    # the only correctness gate — there is no lint/test runner
npm run start

# One-off TS scripts (excluded from tsconfig include, run via tsx):
npx tsx scripts/test-image.ts    # render sample ticket PNGs for all 3 tiers → tmp/

# Supabase migrations (project zxykpzdishvzrawsrwol is already linked):
supabase db push
```

## Architecture

### Two parallel route trees, only one is localized

`src/proxy.ts` is the next-intl middleware (Next 16 renamed `middleware.ts` → `proxy.ts`). Its matcher **deliberately excludes `/admin`, `/t/`, `/api`**, so only the public landing under `src/app/[locale]/` goes through locale routing. With `localePrefix: "as-needed"` and `defaultLocale: "kk"`, the KZ landing lives at `/` and the EN one at `/en`.

The admin and ticket-holder flows live outside that tree. `src/app/admin/layout.tsx` hardcodes `locale="kk"`. `src/app/t/[token]/page.tsx` reads `?lang=en` from `searchParams` to switch locale dynamically. If you add a new top-level non-localized route, add it to the matcher exclusion in `src/proxy.ts`.

### Ticket lifecycle: `issued → activated → used`

Three actors, three surfaces, one row in `public.tickets`:

1. **Manager** signs in at `/admin/login` and creates a ticket on `/admin/new`. `createTicket` in `src/app/admin/actions.ts` calls the `next_order_no(tier)` RPC for a per-tier sequence number (`PS-001`, `VIP-001`, `ST-001`) and inserts a row with a 10-char nanoid token (alphabet excludes ambiguous `I L O 0 1`). Manager forwards `https://<site>/t/<token>` over WhatsApp.
2. **Buyer** opens `/t/[token]`. First open shows a name + **required email** form. Submit calls `activateTicket` server action → `activate_ticket` RPC, which atomically flips `issued → activated`, stamps `holder_name` via `coalesce` (so re-submits don't overwrite). The action also fires `sendTicketActivatedEmail` (best-effort). Subsequent opens show the inline ticket PNG, download button, calendar subscribe button, back-to-site, and a `VenueMap` highlighting the buyer's tier.
3. **Volunteer at the door** uses `/admin/scan` (camera, html5-qrcode). Scanner has a **door picker (1–5)** persisted in `localStorage["tedx-scanner-door"]` — camera doesn't activate until a door is picked. Each scan calls `checkInTicket(token, door)` → `check_in_ticket(p_token, p_door)` RPC. Only `activated` rows transition to `used`; UI colours green/yellow/red based on `prev_status`.

The state machine is enforced inside the SECURITY DEFINER RPCs, not in the action layer.

### Ticket image (replaces PDF)

`/t/[token]/image` serves the ticket as PNG. PDF generation was removed entirely after `pdfjs-dist` + `@napi-rs/canvas` proved fragile on Vercel's serverless runtime (worker setup, native binding hoisting, DOMMatrix polyfills).

Pipeline (`src/lib/ticket-image.ts`):
1. Pre-rendered template PNGs at 300 DPI live in `src/assets/templates/{t-1,t-2,t-3}.png` (one per tier). Generated once locally via `pdftoppm -r 300 src/assets/ticket-template.pdf`. The source PDF is kept for re-rendering if the template changes.
2. `@napi-rs/canvas` loads the template PNG, registers `Inter-Bold.otf` from `src/assets/`, draws holder name + order_no at `LAYOUT` coords (PDF points → 4.17 px/pt at 300 DPI), composites the QR PNG into the right-side pocket on top of a small white pad, and exports `image/png`.
3. Same image is reused everywhere: site download (`<DownloadImageButton/>`), inline `<img>` on the ticket page, and as both inline `<img src=URL>` *and* attachment in the activation email.

`@napi-rs/canvas` is in `next.config.ts:serverExternalPackages` so the native `.node` binding is required at runtime, not bundled.

### Email

`src/lib/email.ts` wraps Resend. Two flows:

- `sendTicketActivatedEmail` — fires from `activateTicket` action right after `activate_ticket` RPC succeeds. Re-fetches the row via `get_ticket_by_token` to attach tier/order_no (the activate RPC doesn't return them). Builds bilingual HTML (no react-email — keeps deps tight). Inline ticket image is loaded via `<img src="https://<site>/t/<token>/image">`, **not** as a `cid:` attachment — the cid path inflated the body past Gmail's ~102 KB "trim similar content" threshold and recipients had to expand a `…` to see the ticket. The PNG is also attached as `TEDxZhenysPark-{orderNo}.png` for download.
- `sendReminderEmail` — D-3 reminder. Triggered by Vercel Cron at `/api/cron/remind` (schedule `0 6 * * *` in `vercel.json`). Endpoint is protected by `Authorization: Bearer ${CRON_SECRET}` and uses `createAdminClient()` to read all `activated` tickets bypassing RLS. `REMIND_OFFSET_DAYS` env (default 3) controls when the daily cron actually sends — every other day it returns `{skipped: true}`.

Both emails set: `Reply-To`, `List-Unsubscribe` + `List-Unsubscribe-Post: One-Click` (Gmail/Yahoo 2024 bulk-sender requirement), `X-Entity-Ref-ID` (prevents Gmail from threading similar tickets), unique per-recipient subject, plain-text alternative. Result: 10/10 mail-tester score.

Resend SDK quirk: input is `contentId` (camelCase) for inline-cid attachments, **not** `content_id`.

### Calendar feed (subscription, not snapshot)

`/calendar.ics` returns a multi-VEVENT subscription feed. The "Add to calendar" button uses `webcal://www.tedx.kz/calendar.ics` — calendar apps **subscribe** and re-poll on `REFRESH-INTERVAL:PT1H` rather than downloading a frozen snapshot.

The route generates one container `VEVENT` (10:00–15:49, `TRANSP:TRANSPARENT` so it doesn't double-block the user's busy time) plus 18 inner slot events: registration, opening, 9 speaker talks (resolved via `speakerSlug` against `event.speakers`), 3 Q&A blocks, coffee break, music guest (Анвар), lunch, closing. Times are stored as `"HH:MM"` Asia/Almaty in the `SLOTS[]` array — no DST, straight UTC = local − 5h.

**To update the schedule**: edit `SLOTS[]` and bump `CALENDAR_SEQUENCE`. Calendar clients use SEQUENCE per RFC 5545 to decide whether to overwrite the local entry. Apple Calendar polls every ~15 min, Google ~4–6 h. UIDs per slot are stable (`tedxzhenyspark-2026-talk-${slug}@tedx.kz`) so updates land on the existing entry instead of duplicating.

Anyone who already imported the *old* single-event `.ics` as a snapshot (before subscription was wired) keeps their stale copy — they need to re-add via webcal:// to start receiving updates.

### Door monitor

`/admin/monitor` calls `monitor_stats()` (one RPC returning `(status, tier, door, count)` rows) and aggregates in JS into total `used / used+activated` with progress bar, per-tier breakdown, and per-door rows. `<AutoRefresh interval={7000}/>` calls `router.refresh()` every 7 s; the page is `dynamic = "force-dynamic"` so refreshes hit Supabase.

### Ticket ↔ landing connection

`src/components/ticket/RememberTicket.tsx` and the `ActivationForm` both write the activated token to `localStorage["tedx-ticket-token"]` (double-write for resilience). `src/components/landing/MyTicketLink.tsx` reads it on mount in `<Nav>` and renders a "Менің билетім / My ticket" pill linking back. SSR-safe: returns `null` until hydration. The pill uses a plain `<a href="/t/<token>">` because `/t/` lives outside the `[locale]` tree.

### Supabase access patterns

`src/lib/supabase/server.ts` exports two clients:

- `createClient()` — SSR cookie-bound client. Subject to RLS. The `tickets` table policy `auth_full_access` lets any authenticated user (managers + scanner accounts) do anything.
- `createAdminClient()` — uses `SUPABASE_SECRET_KEY`, bypasses RLS, no session. Used by the cron route and reserved for server-only ops that must skip RLS.

Public anon traffic only ever calls `get_ticket_by_token` + `activate_ticket`. `check_in_ticket`, `next_order_no`, and `monitor_stats` are revoked from anon and only callable when authenticated. Don't add direct table queries from anon paths — extend an RPC instead.

### Migration history

Run in order; each is idempotent:

1. `20260509000000_init_tickets.sql` — `tickets` table, `ticket_status` enum, RLS, original RPCs.
2. `20260509010000_tiers_and_orders.sql` — adds `tier`, `order_no`, per-tier sequences, `next_order_no()`. Uses `add column if not exists` and `drop function if exists` (an earlier push failed mid-flight).
3. `20260509020000_fix_check_in_ambiguous.sql` — qualifies column refs in `check_in_ticket` (OUT params shadowed table columns → SQLSTATE 42702 "column 'status' is ambiguous").
4. `20260509030000_door_tracking.sql` — adds `tickets.door`, replaces `check_in_ticket` with `(p_token, p_door)` signature, adds `monitor_stats()`. The old single-arg signature is dropped.

If you change a `RETURNS TABLE` shape, you **must** `drop function if exists` first — Postgres refuses `CREATE OR REPLACE` across signature changes.

### Content lives in code, not in the DB

`src/config/event.ts` is the source of truth for event metadata, tiers, speakers (bios in both `kk` and `en`), social handles, and the WhatsApp/Instagram CTA builder. UI strings are in `src/messages/{kk,en}.json`. The DB only stores ticket rows.

### SEO

- **Per-locale metadata** via `generateMetadata` in `src/app/[locale]/page.tsx` and `src/app/[locale]/speakers/[slug]/page.tsx` — title format `<Event> 2026 — <Theme> | <date>, <city>`, plus `alternates.canonical` + `languages` for hreflang, `openGraph`, `twitter:summary_large_image`.
- **Per-page OG images** via Next 16's `next/og` `ImageResponse`. `src/app/[locale]/opengraph-image.tsx` renders the landing card; `src/app/[locale]/speakers/[slug]/opengraph-image.tsx` renders speaker portraits. Both register `Inter-Bold.otf` for Cyrillic.
- **Event JSON-LD schema** via `<EventSchema/>` injected on the landing — schema.org `Event` with date, venue, performers, organizer.
- **`src/app/sitemap.ts`** lists landing + every speaker page in both locales with `hreflang` alternates. **`src/app/robots.ts`** allows `/`, disallows `/admin/`, `/t/`, `/api/`.

### Brand assets

`public/brand/wordmark.svg` is the canonical TEDxZhenysPark wordmark (1304×147, red TEDx + white "Zhenys Park"). Referenced as `<img>` from Hero, Footer, Nav, speaker bio, ticket page — sized via Tailwind `h-*` with `w-auto` so the 8.87:1 aspect stays. `src/app/icon.svg` is a square crop of just the red TEDx mark used as the favicon (Next 16 file convention auto-generates `<link rel="icon">`). `public/sponsors/` holds partner logos rendered in the second marquee on the Theme section. **Always use lowercase Latin `x` in "TEDx"**, never the multiplication sign `×` (U+00D7) — TED brand guideline.

## Environment

Required:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (must match deployment domain — used in `metadataBase`, OG image URLs, and email links)
- `NEXT_PUBLIC_MANAGER_WHATSAPP` (digits only, no `+`)
- `NEXT_PUBLIC_MANAGER_INSTAGRAM` (username, no `@`)
- `RESEND_API_KEY` + verified domain on Resend → ticket activation emails
- `CRON_SECRET` — random string, sent as `Authorization: Bearer …` by Vercel Cron to `/api/cron/remind`
- `SUPABASE_SECRET_KEY` — service-role key. Required by the cron route (`createAdminClient`) to read all activated tickets bypassing RLS.

Optional:
- `EMAIL_FROM` (defaults to `TEDxZhenysPark <tickets@tedx.kz>`)
- `EMAIL_REPLY_TO` (defaults to `tickets@tedx.kz`)
- `REMIND_OFFSET_DAYS` (defaults to `3`)

Production is on Vercel with custom domain `www.tedx.kz`. UptimeRobot pings `/admin/login` every 5 min to keep the Supabase free-tier project from auto-pausing (`auth.getUser()` is the cheapest call that touches Supabase server-side).
