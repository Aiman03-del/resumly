import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { packForVariant, verifyLemonSignature } from "@/lib/payments/lemonsqueezy";

type LemonEvent = {
  meta?: { event_name?: string; custom_data?: { user_id?: string } };
  data?: {
    id?: string | number;
    attributes?: {
      status?: string;
      total?: number;
      currency?: string;
      first_order_item?: { variant_id?: number | string };
    };
  };
};

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const admin = createAdminClient();
  if (!secret || !admin) return NextResponse.json({ error: "Not configured." }, { status: 501 });

  const rawBody = await request.text();
  if (!verifyLemonSignature(rawBody, request.headers.get("x-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: LemonEvent;
  try {
    event = JSON.parse(rawBody) as LemonEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = event.meta?.event_name;
  const orderId = event.data?.id !== undefined ? String(event.data.id) : "";
  const attributes = event.data?.attributes;
  if (!orderId) return NextResponse.json({ received: true });

  if (name === "order_created" && attributes?.status === "paid") {
    const userId = z.string().uuid().safeParse(event.meta?.custom_data?.user_id);
    const pack = packForVariant(attributes.first_order_item?.variant_id);
    if (!userId.success || !pack) {
      console.error("[lemonsqueezy] order ignored: unknown user or variant", { orderId });
      return NextResponse.json({ received: true });
    }

    const { error } = await admin.rpc("grant_credits", {
      p_user: userId.data,
      p_provider: "lemonsqueezy",
      p_ref: orderId,
      p_pack: pack.id,
      p_credits: pack.credits,
      p_amount: (attributes.total ?? 0) / 100,
      p_currency: attributes.currency ?? "USD",
    });
    if (error) {
      console.error("[lemonsqueezy] grant failed", { code: error.code });
      if (error.code !== "23503") return NextResponse.json({ error: "Try again." }, { status: 500 });
    }
  }

  if (name === "order_refunded") {
    const { error } = await admin.rpc("refund_credits", { p_provider: "lemonsqueezy", p_ref: orderId });
    if (error) {
      console.error("[lemonsqueezy] refund failed", { code: error.code });
      return NextResponse.json({ error: "Try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}