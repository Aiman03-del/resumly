import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { isJsonRequest, verifyCurrentPassword } from "@/lib/account-auth";

const bodySchema = z.object({
  confirm: z.literal("DELETE"),
  password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Type DELETE and enter your password to confirm." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  const limit = checkRateLimit(`delete-account:${user.id}`, 5, 15 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  if (!(await verifyCurrentPassword(user.email, parsed.data.password))) {
    return NextResponse.json({ error: "Your password is incorrect." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    console.error("[account/delete] SUPABASE_SERVICE_ROLE_KEY is not configured");
    return NextResponse.json(
      { error: "Account deletion isn't available right now. Please contact support." },
      { status: 501 },
    );
  }

  const { error: resumesError } = await admin.from("resumes").delete().eq("user_id", user.id);
  if (resumesError) {
    console.error("[account/delete] resumes delete failed", { code: resumesError.code });
    return NextResponse.json({ error: "We couldn't delete your data. Please try again." }, { status: 503 });
  }
  await admin.from("api_usage").delete().eq("user_id", user.id).then(() => undefined, () => undefined);

  const { error: userError } = await admin.auth.admin.deleteUser(user.id);
  if (userError) {
    console.error("[account/delete] auth delete failed", { code: userError.code, status: userError.status });
    return NextResponse.json({ error: "We couldn't delete your account. Please try again." }, { status: 503 });
  }

  await supabase.auth.signOut().catch(() => undefined);
  return NextResponse.json({ ok: true });
}