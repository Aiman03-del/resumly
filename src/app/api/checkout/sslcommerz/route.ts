import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isJsonRequest } from "@/lib/account-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPack } from "@/lib/credit-packs";
import { createSslcommerzSession } from "@/lib/payments/sslcommerz";

const bodySchema = z.object({ packId: z.string().min(1).max(40) });

/** Starts a BDT checkout (bKash, Nagad, cards) for a credit pack. */
export async function POST(request: NextRequest) {
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  const pack = parsed.success ? getPack(parsed.data.packId) : undefined;
  if (!pack) return NextResponse.json({ error: "Unknown credit pack." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return NextResponse.json({ error: "Please log in again." }, { status: 401 });

  const limit = checkRateLimit(`checkout:${user.id}`, 10, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    console.error("[checkout/sslcommerz] SUPABASE_SERVICE_ROLE_KEY is not configured");
    return NextResponse.json({ error: "Payments aren't available right now." }, { status: 501 });
  }

  const tranId = `rsm_${randomUUID().replace(/-/g, "")}`;
  const { error: insertError } = await admin.from("payments").insert({
    user_id: user.id,
    provider: "sslcommerz",
    provider_ref: tranId,
    pack_id: pack.id,
    credits: pack.credits,
    amount: pack.priceBdt,
    currency: "BDT",
    status: "pending",
  });
  if (insertError) {
    console.error("[checkout/sslcommerz] insert failed", { code: insertError.code });
    return NextResponse.json({ error: "Could not start the payment. Please try again." }, { status: 503 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
  const url = await createSslcommerzSession({
    tranId,
    amountBdt: pack.priceBdt,
    email: user.email,
    name: user.email.split("@")[0],
    phone: user.phone,
    productName: `${pack.credits} AI credits`,
    siteUrl,
  });
  if (!url) {
    await admin.from("payments").update({ status: "failed" }).eq("provider_ref", tranId);
    return NextResponse.json({ error: "The payment gateway is unavailable. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ url });
}