import type { Tier } from "@/config/event";

/**
 * Caravansaray Arena — schematic seat map.
 * 12 sections fanning around the stage.
 *
 *           D2              D1
 *      C2  B2  B4  B3  B1  C1
 *          A2  A4  A3  A1
 *              [ STAGE ]
 *
 * Tier mapping:
 *   PRE-SALE: A1, A2 (110 + 110 seats)
 *   VIP:      A3, A4 (84 + 84, first row reserved for guests)
 *   STANDARD: B1-B4, C1-C2, D1-D2
 */

type SectionId =
  | "A1" | "A2" | "A3" | "A4"
  | "B1" | "B2" | "B3" | "B4"
  | "C1" | "C2"
  | "D1" | "D2";

const SECTION_TIER: Record<SectionId, Tier> = {
  A1: "pre-sale", A2: "pre-sale",
  A3: "vip", A4: "vip",
  B1: "standard", B2: "standard", B3: "standard", B4: "standard",
  C1: "standard", C2: "standard",
  D1: "standard", D2: "standard",
};

type Box = { x: number; y: number; w: number; h: number };

const SECTIONS: Record<SectionId, Box> = {
  // Far back wings
  D2: { x: 70,  y: 30,  w: 110, h: 60 },
  D1: { x: 620, y: 30,  w: 110, h: 60 },
  // Mid ring (back-center + side wings)
  C2: { x: 30,  y: 105, w: 90,  h: 70 },
  B2: { x: 130, y: 105, w: 110, h: 70 },
  B4: { x: 250, y: 105, w: 110, h: 70 },
  B3: { x: 440, y: 105, w: 110, h: 70 },
  B1: { x: 560, y: 105, w: 110, h: 70 },
  C1: { x: 680, y: 105, w: 90,  h: 70 },
  // Front ring (closest to stage)
  A2: { x: 150, y: 195, w: 110, h: 70 },
  A4: { x: 270, y: 195, w: 110, h: 70 },
  A3: { x: 420, y: 195, w: 110, h: 70 },
  A1: { x: 540, y: 195, w: 110, h: 70 },
};

const STAGE: Box = { x: 290, y: 290, w: 220, h: 36 };
const VIEWBOX = "0 0 800 350";

const TIER_FILL = {
  "pre-sale": "var(--color-red)",
  vip: "#d4af37",
  standard: "#3a3a3a",
} as const;

const TIER_LABEL = {
  "pre-sale": "PRE-SALE",
  vip: "VIP",
  standard: "STANDARD",
} as const;

export function VenueMap({ tier }: { tier: Tier | null }) {
  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={VIEWBOX}
        className="w-full"
        role="img"
        aria-label="Caravansaray Arena seat map"
      >
        {(Object.keys(SECTIONS) as SectionId[]).map((id) => {
          const box = SECTIONS[id];
          const sectionTier = SECTION_TIER[id];
          const active = tier === sectionTier;
          const fill = TIER_FILL[sectionTier];
          return (
            <g key={id} opacity={tier == null || active ? 1 : 0.25}>
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx={6}
                fill={fill}
                stroke={active ? "white" : "transparent"}
                strokeWidth={active ? 3 : 0}
              />
              <text
                x={box.x + box.w / 2}
                y={box.y + box.h / 2 + 6}
                textAnchor="middle"
                className="font-display"
                fontSize={18}
                fontWeight={800}
                fill={sectionTier === "vip" ? "#000" : "#fff"}
              >
                {id}
              </text>
            </g>
          );
        })}

        {/* Stage */}
        <rect
          x={STAGE.x}
          y={STAGE.y}
          width={STAGE.w}
          height={STAGE.h}
          rx={4}
          fill="none"
          stroke="var(--color-fg-muted)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <text
          x={STAGE.x + STAGE.w / 2}
          y={STAGE.y + STAGE.h / 2 + 5}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          letterSpacing="0.3em"
          fill="var(--color-fg-muted)"
        >
          СЦЕНА
        </text>
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-wider text-[var(--color-fg-muted)]">
        {(["pre-sale", "vip", "standard"] as const).map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{
                background: TIER_FILL[t],
                outline: tier === t ? "2px solid white" : undefined,
                outlineOffset: tier === t ? 1 : undefined,
              }}
            />
            {TIER_LABEL[t]}
          </span>
        ))}
      </div>
    </div>
  );
}
