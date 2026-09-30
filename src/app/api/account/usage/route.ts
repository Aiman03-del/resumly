import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_LIMITS, type AiRoute } from "@/lib/ai-limits";

export const dynamic = "force-dynamic";

const ROUTES = Object.keys(AI_LIMITS) as AiRoute[];

function pick(row: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) if (row[key] !== undefined && row[key] !== null) return row[key];
  return undefined;
}

/** Today's AI usage for the signed-in user. */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in again." }, { status: 401 });

  const { data, error } = await supabase.from("api_usage").select("*");
  const used: Record<string, number> = Object.fromEntries(ROUTES.map((route) => [route, 0]));

  if (error) {
    console.error("[account/usage] read failed", { code: error.code });
    return NextResponse.json({ available: false, limits: AI_LIMITS, used });
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const row of (data ?? []) as Record<string, unknown>[]) {
    const route = String(pick(row, ["route", "endpoint", "feature"]) ?? "");
    if (!(route in used)) continue;
    const day = String(pick(row, ["day", "date", "usage_date", "used_on", "period"]) ?? today);
    if (!day.startsWith(today)) continue;
    const count = Number(pick(row, ["count", "request_count", "requests", "calls", "usage"]) ?? 0);
    if (Number.isFinite(count)) used[route] += count;
  }
  return NextResponse.json({ available: true, limits: AI_LIMITS, used });
}