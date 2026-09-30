import { NextRequest, NextResponse } from "next/server";
import { fulfillSslcommerz } from "@/lib/payments/sslcommerz";

/** SSLCommerz IPN: validate the payment with the gateway before granting credits. */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const valId = String(form?.get("val_id") ?? "");
  if (valId) await fulfillSslcommerz(valId);
  return NextResponse.json({ received: true });
}