import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { friendlyLoginError, GENERIC_LOGIN_ERROR } from "@/lib/auth-errors";

const bodySchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      console.error("[auth/login] sign-in failed", { code: error.code, status: error.status });
      const status = error.status === 429 ? 429 : error.status && error.status >= 500 ? 503 : 401;
      return NextResponse.json({ error: friendlyLoginError(error) }, { status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/login] unexpected failure", err instanceof Error ? err.name : "unknown");
    return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 503 });
  }
}
