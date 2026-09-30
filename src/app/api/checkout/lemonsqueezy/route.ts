import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isJsonRequest } from "@/lib/account-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPack } from "@/lib/credit-packs";
import { variantIdForPack } from "@/lib/payments/lemonsqueezy";

const bodySchema = z.object({ packId: z.string().min(1).max(40) });

/** Starts a USD checkout (cards, PayPal, wallets) for a credit pack. */
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

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = variantIdForPack(pack);
  if (!apiKey || !storeId || !variantId) {
    console.error("[checkout/lemonsqueezy] missing LEMONSQUEEZY_* configuration", { pack: pack.id });
    return NextResponse.json({ error: "Payments aren't available right now." }, { status: 501 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: user.email,
            custom: { user_id: user.id, pack_id: pack.id },
          },
          product_options: { redirect_url: `${siteUrl}/settings?tab=usage&payment=success` },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as { data?: { attributes?: { url?: string } } } | null;
  const url = json?.data?.attributes?.url;
  if (!response.ok || !url) {
    console.error("[checkout/lemonsqueezy] checkout failed", { status: response.status });
    return NextResponse.json({ error: "The payment gateway is unavailable. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ url });
}