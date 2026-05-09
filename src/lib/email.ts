import "server-only";
import { Resend } from "resend";
import { event } from "@/config/event";
import { TIER_LABEL, type Tier } from "@/config/event";
import { generateTicketPdf } from "@/lib/pdf";

// Lazy client — Resend constructor throws on missing key, which would fail
// `next build` during page-data collection on environments without the key.
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.EMAIL_FROM ?? "TEDxZhenysPark <tickets@tedx.kz>";
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tedx.kz").replace(
  /\/$/,
  "",
);

export type TicketEmailArgs = {
  to: string;
  token: string;
  holderName: string;
  tier: Tier | null;
  orderNo: string | null;
};

/**
 * Send the "ticket activated" email with PDF attachment. Best-effort —
 * any failure is logged and swallowed so activation never blocks on email.
 */
export async function sendTicketActivatedEmail(args: TicketEmailArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing, skipping send");
    return;
  }
  if (!isEmail(args.to)) return;

  try {
    const attachments = [];
    if (args.tier && args.orderNo) {
      const pdf = await generateTicketPdf({
        tier: args.tier,
        holderName: args.holderName,
        orderNo: args.orderNo,
        token: args.token,
      });
      attachments.push({
        filename: `TEDxZhenysPark-${args.orderNo}.pdf`,
        content: Buffer.from(pdf).toString("base64"),
      });
    }

    await resend.emails.send({
      from: FROM,
      to: args.to,
      subject: "TEDxZhenysPark — билетіңіз дайын / your ticket is ready",
      html: ticketHtml(args),
      attachments,
    });
  } catch (e) {
    console.error("[email] sendTicketActivatedEmail failed:", e);
  }
}

export type ReminderEmailArgs = {
  to: string;
  token: string;
  holderName: string;
};

export async function sendReminderEmail(args: ReminderEmailArgs) {
  const resend = getResend();
  if (!resend) return;
  if (!isEmail(args.to)) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: args.to,
      subject: "TEDxZhenysPark — еске салу / friendly reminder",
      html: reminderHtml(args),
    });
  } catch (e) {
    console.error("[email] sendReminderEmail failed:", e);
  }
}

function isEmail(s: string | null | undefined): s is string {
  return !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

// ── Templates ──────────────────────────────────────────────────────────
// Plain inline HTML — no react-email to keep deps tight. Bilingual (kk+en)
// since we don't know the recipient's preferred language.

const wrapper = (body: string) => `<!doctype html>
<html lang="kk">
<head>
<meta charset="utf-8">
<title>TEDxZhenysPark</title>
</head>
<body style="margin:0;padding:0;background:#050505;color:#f5f5f5;font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050505;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0d0d0d;border:1px solid #1f1f1f;border-radius:16px;">
        <tr><td style="padding:32px 28px;">
          <div style="font-weight:900;font-size:22px;letter-spacing:-0.02em;">
            <span style="color:#e62b1e;">TEDx</span>ZhenysPark
          </div>
          ${body}
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #1f1f1f;font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.1em;">
            This independent TEDx event is operated under license from TED
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

function ticketHtml(args: TicketEmailArgs) {
  const tierLabel = args.tier ? TIER_LABEL[args.tier] : "—";
  const order = args.orderNo ?? "—";
  const ticketUrl = `${SITE}/t/${args.token}`;
  const calendarUrl = `${SITE}/calendar.ics`;
  return wrapper(`
    <h1 style="margin:24px 0 8px;font-size:28px;font-weight:800;line-height:1.1;">
      Билетіңіз дайын<br><span style="color:#8a8a8a;font-size:18px;font-weight:600;">Your ticket is ready</span>
    </h1>
    <p style="margin:8px 0 24px;color:#8a8a8a;font-size:15px;line-height:1.5;">
      ${escape(args.holderName)}, ${event.dateLabel.kk} күні ${event.venue.kk}-ға күтеміз.<br>
      ${escape(args.holderName)}, see you on ${event.dateLabel.en} at ${event.venue.en}.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #1f1f1f;border-radius:12px;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #1f1f1f;font-size:13px;">
        <div style="color:#8a8a8a;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Tier</div>
        <div style="margin-top:4px;font-weight:700;">${tierLabel} · ${order}</div>
      </td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid #1f1f1f;font-size:13px;">
        <div style="color:#8a8a8a;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Күні · Date</div>
        <div style="margin-top:4px;font-weight:700;">${event.dateLabel.kk} · ${event.dateLabel.en}</div>
      </td></tr>
      <tr><td style="padding:14px 18px;font-size:13px;">
        <div style="color:#8a8a8a;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Орын · Venue</div>
        <div style="margin-top:4px;font-weight:700;">${event.venue.kk}, ${event.city.kk}</div>
      </td></tr>
    </table>
    <a href="${ticketUrl}" style="display:inline-block;background:#e62b1e;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:700;font-size:15px;">
      Билетті ашу · Open ticket
    </a>
    <a href="${calendarUrl}" style="display:inline-block;margin-left:8px;border:1px solid #1f1f1f;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:700;font-size:15px;">
      Күнтізбе · Calendar
    </a>
    <p style="margin:24px 0 0;color:#8a8a8a;font-size:13px;line-height:1.5;">
      QR-кодыңыз PDF файлда бекітілген. Кіру кезінде волонтёрге көрсетіңіз.<br>
      Your QR code is attached as PDF. Show it to a volunteer at the entrance.
    </p>
  `);
}

function reminderHtml(args: ReminderEmailArgs) {
  const ticketUrl = `${SITE}/t/${args.token}`;
  return wrapper(`
    <h1 style="margin:24px 0 8px;font-size:26px;font-weight:800;line-height:1.1;">
      ${event.dateLabel.kk} жақын<br><span style="color:#8a8a8a;font-size:16px;font-weight:600;">${event.dateLabel.en} is close</span>
    </h1>
    <p style="margin:8px 0 24px;color:#8a8a8a;font-size:15px;line-height:1.5;">
      ${escape(args.holderName)}, ${event.venue.kk}-да 08:00-де тіркелу басталады, бірінші сөйлесу 10:00-де.<br>
      ${escape(args.holderName)}, doors open at 08:00, first talk at 10:00 at ${event.venue.en}.
    </p>
    <a href="${ticketUrl}" style="display:inline-block;background:#e62b1e;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:700;font-size:15px;">
      Билетті ашу · Open ticket
    </a>
  `);
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
