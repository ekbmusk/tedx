import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTicketImage } from "@/lib/ticket-image";
import { TIERS, type Tier } from "@/config/event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_ticket_by_token", {
    p_token: token,
  });
  if (error) return new NextResponse("not_found", { status: 404 });

  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        status: "issued" | "activated" | "used";
        holder_name: string | null;
        tier: string | null;
        order_no: string | null;
      }
    | undefined;

  if (!row) return new NextResponse("not_found", { status: 404 });
  if (row.status === "issued") {
    return new NextResponse("not_activated", { status: 403 });
  }
  if (!row.tier || !row.order_no) {
    return new NextResponse("ticket_missing_tier", { status: 409 });
  }
  if (!TIERS.includes(row.tier as Tier)) {
    return new NextResponse("invalid_tier", { status: 500 });
  }

  const png = await generateTicketImage({
    tier: row.tier as Tier,
    holderName: row.holder_name ?? "",
    orderNo: row.order_no,
    token,
  });

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="TEDxZhenysPark-${row.order_no}.png"`,
      "Cache-Control": "no-store",
    },
  });
}
