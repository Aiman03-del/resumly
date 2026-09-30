import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const used: Record<string, number> = Object.fromEntries(ROUTES.map((route) => [route, 0]));

  const result = await supabase.from("api_usage").select("*").eq("user_id", user.id);
  let rows = result.data;
  let failed = Boolean(result.error);
  let reason = result.error?.code ?? null;

  if (result.error) {
    console.error("[account/usage] read failed", {
      code: result.error.code,
      message: result.error.message,
    });
  }

  // On an error or an empty list, retry with the service-role client,
  // always filtered by the authenticated user's id.
  if (failed || !rows || rows.length === 0) {
    const admin = createAdminClient();
    if (admin) {
      const adminResult = await admin.from("api_usage").select("*").eq("user_id", user.id);
      if (!adminResult.error) {
        rows = adminResult.data;
        failed = false;
        reason = null;
      } else {
        console.error("[account/usage] admin read failed", { code: adminResult.error.code });
      }
    }
  }

  if (failed) {
    return NextResponse.json({ available: false, reason, limits: AI_LIMITS, used });
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const row of (rows ?? []) as Record<string, unknown>[]) {
    const route = String(pick(row, ["route", "endpoint", "feature"]) ?? "");
    if (!(route in used)) continue;
    const day = String(pick(row, ["day", "date", "usage_date", "used_on", "period"]) ?? today);
    if (!day.startsWith(today)) continue;
    const count = Number(pick(row, ["count", "request_count", "requests", "calls", "usage"]) ?? 0);
    if (Number.isFinite(count)) used[route] += count;
  }
  return NextResponse.json({ available: true, limits: AI_LIMITS, used });
}