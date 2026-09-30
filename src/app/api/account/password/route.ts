import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPasswordStrength } from "@/lib/password-strength";
import { isJsonRequest, verifyCurrentPassword } from "@/lib/account-auth";

const bodySchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your current and new password." }, { status: 400 });
  }
  const { currentPassword, newPassword } = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  const limit = checkRateLimit(`password:${user.id}`, 5, 15 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  if (!getPasswordStrength(newPassword).isStrong) {
    return NextResponse.json({ error: "Choose a stronger password that meets all the requirements." }, { status: 400 });
  }
  if (newPassword === currentPassword) {
    return NextResponse.json({ error: "Your new password must be different from the current one." }, { status: 400 });
  }
  if (!(await verifyCurrentPassword(user.email, currentPassword))) {
    return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    console.error("[account/password] update failed", { code: error.code, status: error.status });
    return NextResponse.json({ error: "We couldn't change your password right now. Please try again." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}