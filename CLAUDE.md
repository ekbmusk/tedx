# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind 4 · next-intl · Supabase (Auth + Postgres + RLS) · pdf-lib for ticket PDFs · html5-qrcode for the scanner. Vercel Analytics + Speed Insights are mounted in the root layout.

## Commands

```bash
npm run dev      # next dev (Turbopack)
npm run build    # the only correctness gate — there is no lint/test runner
npm run start

# One-off TS scripts (excluded from tsconfig include, run via tsx):
npx tsx scripts/test-pdf.ts      # render sample PDFs for all 3 tiers → tmp/
npx tsx scripts/probe-pdf.ts     # print template page sizes
npx tsx scripts/probe-font.ts    # check Cyrillic glyph coverage in Inter-Bold
npx tsx scripts/probe-grid.ts    # overlay a coord grid on every template page
                                 # for re-calibrating LAYOUT constants

# Supabase migrations:
supabase db push                 # already linked to project zxykpzdishvzrawsrwol
```

## Architecture

### Two parallel route trees, only one is localized

`src/proxy.ts` is the next-intl middleware (Next 16 renamed `middleware.ts` → `proxy.ts`). Its matcher **deliberately excludes `/admin`, `/t/`, `/api`**, so only the public landing under `src/app/[locale]/` goes through locale routing. With `localePrefix: "as-needed"` and `defaultLocale: "kk"`, the KZ landing lives at `/` and the EN one at `/en`.

The admin and ticket holder flows live outside that tree and pin their UI strings manually: `src/app/admin/layout.tsx` hardcodes `locale="kk"`, and `src/app/t/[token]/page.tsx` uses `getTranslations("ticket")` against the default locale. If you add a new top-level non-localized route, add it to the matcher exclusion in `src/proxy.ts`.

### Ticket lifecycle: `issued → activated → used`

Three actors, three surfaces, one row in `public.tickets`:

1. **Manager** signs in at `/admin/login` and creates a ticket on `/admin/new`. `createTicket` in `src/app/admin/actions.ts` calls the `next_order_no(tier)` RPC to get a per-tier sequence number (`PS-001`, `VIP-001`, `ST-001`) and inserts a row with a 10-char nanoid token (alphabet excludes ambiguous `I L O 0 1`). The manager forwards `https://<site>/t/<token>` to the buyer over WhatsApp.
2. **Buyer** opens `/t/[token]`. First open shows a name form; submit calls `activateTicket` server action → `activate_ticket` RPC, which atomically flips `issued → activated`, stamps `holder_name` via `coalesce` (so re-submits don't overwrite), and sets `activated_at`. Second open shows QR + PDF download + a `VenueMap` SVG that highlights the buyer's tier section.
3. **Volunteer at the door** uses `/admin/scan` (camera, html5-qrcode). The scanner has a **door picker (1–5)** persisted in `localStorage["tedx-scanner-door"]` — the camera doesn't activate until a door is picked. Each scan calls `checkInTicket(token, door)` → `check_in_ticket(p_token, p_door)` RPC. Only `activated` rows transition to `used`; `issued` and `used` rows return their current state and the UI colors the response (green = pass, yellow = already used, red = not activated).

The state machine is enforced inside the SECURITY DEFINER RPCs, not in the action layer — the actions only read the result and shape it for the client.

### Door monitor

`/admin/monitor` is a server-rendered dashboard that calls `monitor_stats()` (one RPC, returns `(status, tier, door, count)` rows) and aggregates in JS into three views: total `used / used+activated` with a progress bar, per-tier breakdown, and per-door rows. A small client component `<AutoRefresh interval={7000} />` calls `router.refresh()` every 7s. The page is `dynamic = "force-dynamic"` so refreshes are not cached.

### Ticket ↔ landing connection

Two client components glue the activation flow back to the public site:

- `src/components/ticket/RememberTicket.tsx` and `src/components/ticket/ActivationForm.tsx` both write the activated token to `localStorage["tedx-ticket-token"]` (double-write for resilience: form on submit, page on mount).
- `src/components/landing/MyTicketLink.tsx` reads that key on mount in `<Nav>` and, if present, renders a "Менің билетім / My ticket" pill linking back to `/t/<token>`. SSR-safe (renders `null` until hydration).

The "back to site" button on the ticket page uses a plain `<a href="/">` (not next-intl `Link`) because `/t/<token>` lives outside the `[locale]` tree.

### Supabase access patterns

`src/lib/supabase/server.ts` exports two clients:

- `createClient()` — SSR cookie-bound client used by every server action and route handler. Subject to RLS. The `tickets` table policy `auth_full_access` allows authenticated managers/scanners to do anything; everything anonymous goes through the SECURITY DEFINER RPCs (`get_ticket_by_token`, `activate_ticket`).
- `createAdminClient()` — `SUPABASE_SECRET_KEY` only, bypasses RLS, no session. Currently unused but kept for server-only operations that must skip RLS.

Public anon traffic only ever calls `get_ticket_by_token` + `activate_ticket`. `check_in_ticket`, `next_order_no`, and `monitor_stats` are revoked from anon and only callable when authenticated. Don't add direct table queries from anon paths — extend the RPC instead.

### Migration history

Run in order; each is idempotent:

1. `20260509000000_init_tickets.sql` — `tickets` table, `ticket_status` enum, RLS, original RPCs.
2. `20260509010000_tiers_and_orders.sql` — adds `tier`, `order_no`, per-tier sequences, `next_order_no()`. Uses `add column if not exists` and `drop function if exists` because of an earlier failed push.
3. `20260509020000_fix_check_in_ambiguous.sql` — qualifies column refs in `check_in_ticket` (OUT params shadowed table columns → `column "status" is ambiguous`, SQLSTATE 42702).
4. `20260509030000_door_tracking.sql` — adds `tickets.door`, replaces `check_in_ticket` with the 2-arg `(p_token, p_door)` signature, adds `monitor_stats()`. The old single-arg signature is dropped.

If you change a `RETURNS TABLE` shape, you **must** `drop function if exists` first — Postgres refuses `CREATE OR REPLACE` across signature changes.

### PDF generation

Tickets are rendered server-side from `src/assets/ticket-template.pdf`, a single 3-page template where **page index = tier** (`pre-sale=0, vip=1, standard=2`). `src/lib/pdf.ts` opens the template once (cached in module scope), drops the holder name and order number at hardcoded coordinates (`LAYOUT` constants in PDF points, origin bottom-left), composites a generated QR PNG into a "pocket" between the two preprinted slot lines on the right, and returns the bytes. The route handler `src/app/t/[token]/pdf/route.ts` declares `runtime = "nodejs"` (pdf-lib + fs needed) and refuses `issued` tickets and legacy rows missing `tier`/`order_no` (returns 409 `ticket_missing_tier`).

If you change the template, re-run `npx tsx scripts/probe-grid.ts` — it overlays a numbered red/blue grid on every page so you can read off exact pt coordinates for the new template's slot lines and recalibrate `LAYOUT`. Cyrillic rendering depends on `src/assets/Inter-Bold.otf` registered with `@pdf-lib/fontkit`.

### Content lives in code, not in the DB

`src/config/event.ts` is the source of truth for event metadata, tiers, speakers (with bios in both `kk` and `en`), social handles, and the WhatsApp/Instagram CTA builder. UI strings are in `src/messages/{kk,en}.json`. The DB only knows about ticket rows; nothing about the event, speakers, or copy is persisted server-side.

### Brand assets

`public/brand/wordmark.svg` is the canonical TEDxZhenysPark wordmark (1304×147, red TEDx + white "Zhenys Park"). It's referenced as `<img>` from Hero, Footer, Nav, speaker bio, and ticket activation pages — sized via Tailwind `h-*` with `w-auto` so the 8.87:1 aspect is preserved. `src/app/icon.svg` is a square crop of just the red TEDx mark used as the favicon (Next 16 file convention auto-generates `<link rel="icon">`). `public/sponsors/` holds partner logos rendered in the second marquee on the Theme section. **Always use lowercase Latin `x` in "TEDx"**, never the multiplication sign `×` (U+00D7) — TED brand guidelines.

## Environment

Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MANAGER_WHATSAPP` (digits only, no `+`), `NEXT_PUBLIC_MANAGER_INSTAGRAM` (username, no `@`).

Optional: `SUPABASE_SECRET_KEY` (only if you need `createAdminClient()`).

Production is on Vercel with custom domain `www.tedx.kz`; UptimeRobot pings `/admin/login` every 5 min to keep the Supabase free-tier project from auto-pausing.
