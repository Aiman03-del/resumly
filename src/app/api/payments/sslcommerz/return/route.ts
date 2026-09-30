import { NextRequest, NextResponse } from "next/server";
import { fulfillSslcommerz } from "@/lib/payments/sslcommerz";

/** Where SSLCommerz sends the customer's browser after checkout. */
export async function POST(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  let result = status === "cancel" ? "cancel" : "fail";

  if (status === "success") {
    const form = await request.formData().catch(() => null);
    const valId = String(form?.get("val_id") ?? "");
    result = valId && (await fulfillSslcommerz(valId)) ? "success" : "pending";
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
  return NextResponse.redirect(`${siteUrl}/settings?tab=usage&payment=${result}`, 303);
}