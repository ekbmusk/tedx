"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { checkInTicket } from "@/app/admin/actions";
import { TIER_LABEL, type Tier } from "@/config/event";

const DOORS = ["1", "2", "3", "4", "5"] as const;
const DOOR_STORAGE_KEY = "tedx-scanner-door";

type Result =
  | { kind: "ok"; holder: string | null; tier: Tier | null; door: string | null }
  | { kind: "already_used"; holder: string | null }
  | { kind: "not_activated" }
  | { kind: "not_found" }
  | { kind: "error"; message: string };

export function Scanner() {
  const t = useTranslations("admin.scanner");
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const lastTokenRef = useRef<string | null>(null);
  const lastTimeRef = useRef<number>(0);

  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  const [door, setDoor] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const doorRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(DOOR_STORAGE_KEY);
      if (v && (DOORS as readonly string[]).includes(v)) setDoor(v);
    } catch {
      // localStorage unavailable
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    doorRef.current = door;
    if (door) {
      try {
        localStorage.setItem(DOOR_STORAGE_KEY, door);
      } catch {
        // ignore
      }
    }
  }, [door]);

  // Extract token from QR payload (supports raw token or full URL)
  const extractToken = (text: string): string | null => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    try {
      const u = new URL(trimmed);
      const m = u.pathname.match(/\/t\/([^/?#]+)/);
      if (m) return m[1];
    } catch {
      // not a URL → treat as bare token
    }
    return /^[A-Za-z0-9_-]{6,}$/.test(trimmed) ? trimmed : null;
  };

  const handleDecoded = (raw: string) => {
    const token = extractToken(raw);
    if (!token) return;
    const now = Date.now();
    if (lastTokenRef.current === token && now - lastTimeRef.current < 3000) return;
    lastTokenRef.current = token;
    lastTimeRef.current = now;

    startTransition(async () => {
      const res = await checkInTicket(token, doorRef.current);
      if (!res.ok) {
        setResult({ kind: "error", message: res.error });
        return;
      }
      if (res.prevStatus === "issued") {
        setResult({ kind: "not_activated" });
      } else if (res.prevStatus === "used") {
        setResult({ kind: "already_used", holder: res.holderName });
      } else {
        setResult({
          kind: "ok",
          holder: res.holderName,
          tier: res.tier as Tier | null,
          door: res.door,
        });
      }
    });
  };

  useEffect(() => {
    if (!door) return;
    let cancelled = false;
    let scannerInstance: { stop: () => Promise<void> } | null = null;

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled || !containerRef.current) return;

      const id = "qr-reader";
      containerRef.current.innerHTML = `<div id="${id}" class="w-full overflow-hidden rounded-xl"></div>`;

      const html5 = new Html5Qrcode(id, { verbose: false });
      try {
        await html5.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decodedText) => handleDecoded(decodedText),
          () => {
            // ignore decode misses
          },
        );
        // If the effect was torn down (door change, unmount) while start() was
        // in flight, stop the freshly-opened camera so we don't leak it.
        if (cancelled) {
          try {
            await html5.stop();
            await html5.clear();
          } catch {}
          return;
        }
        scannerInstance = {
          stop: async () => {
            try {
              await html5.stop();
              await html5.clear();
            } catch {}
          },
        };
        scannerRef.current = scannerInstance;
      } catch (e) {
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">${t(
            "permission",
          )}</div>`;
        }
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
      scannerRef.current?.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [door]);

  return (
    <div className="flex flex-col gap-4">
      <DoorPicker
        value={door}
        onChange={setDoor}
        label={t("doorLabel")}
        placeholder={t("pickDoor")}
      />

      {hydrated && !door ? (
        <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-[var(--color-line)] bg-black/40 p-6 text-center text-sm text-[var(--color-fg-muted)]">
          {t("pickDoor")}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="aspect-square w-full overflow-hidden rounded-xl border border-[var(--color-line)] bg-black"
        />
      )}

      <div className="min-h-[120px]">
        {pending && (
          <div className="rounded-md border border-[var(--color-line)] bg-black/40 p-4 text-sm text-[var(--color-fg-muted)]">
            …
          </div>
        )}
        {result && <ResultCard result={result} onReset={() => setResult(null)} />}
      </div>
    </div>
  );
}

function DoorPicker({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string | null;
  onChange: (v: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
        {label}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-[var(--color-line)] bg-[var(--color-bg-soft)] px-3 py-2.5 text-base text-white outline-none transition-colors focus:border-[var(--color-red)]"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {DOORS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultCard({
  result,
  onReset,
}: {
  result: Result;
  onReset: () => void;
}) {
  const t = useTranslations("admin.scanner");

  const palette = {
    ok: "border-green-500/50 bg-green-500/10 text-green-200",
    already_used: "border-yellow-500/50 bg-yellow-500/10 text-yellow-200",
    not_activated: "border-yellow-500/50 bg-yellow-500/10 text-yellow-200",
    not_found: "border-red-500/50 bg-red-500/10 text-red-200",
    error: "border-red-500/50 bg-red-500/10 text-red-200",
  } as const;

  const titles: Record<Result["kind"], string> = {
    ok: t("ok"),
    already_used: t("alreadyUsed"),
    not_activated: t("notActivated"),
    not_found: t("notFound"),
    error: "error",
  };

  return (
    <div
      className={`rounded-xl border p-5 ${palette[result.kind]}`}
      role="status"
      aria-live="polite"
    >
      <div className="font-display text-2xl font-extrabold">
        {titles[result.kind]}
      </div>
      {(result.kind === "ok" || result.kind === "already_used") && result.holder && (
        <div className="mt-2 text-base">{result.holder}</div>
      )}
      {result.kind === "ok" && (result.tier || result.door) && (
        <div className="text-sm opacity-80">
          {[
            result.tier ? TIER_LABEL[result.tier] : null,
            result.door ? `${t("doorLabel")} ${result.door}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
      )}
      {result.kind === "error" && (
        <div className="mt-2 text-sm opacity-80">{result.message}</div>
      )}
      <button
        onClick={onReset}
        className="mt-4 rounded-full border border-current/40 px-4 py-1.5 text-xs"
      >
        {t("scanAgain")}
      </button>
    </div>
  );
}
