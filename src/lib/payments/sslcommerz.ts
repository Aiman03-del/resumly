import { createAdminClient } from "@/lib/supabase/admin";

function baseUrl() {
  return process.env.SSLCOMMERZ_SANDBOX === "false"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";
}

function credentials() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  return storeId && storePassword ? { storeId, storePassword } : null;
}

/** Creates a hosted checkout session and returns the gateway page URL. */
export async function createSslcommerzSession(input: {
  tranId: string;
  amountBdt: number;
  email: string;
  name: string;
  phone?: string | null;
  productName: string;
  siteUrl: string;
}): Promise<string | null> {
  const creds = credentials();
  if (!creds) return null;

  const { siteUrl } = input;
  const body = new URLSearchParams({
    store_id: creds.storeId,
    store_passwd: creds.storePassword,
    total_amount: input.amountBdt.toFixed(2),
    currency: "BDT",
    tran_id: input.tranId,
    success_url: `${siteUrl}/api/payments/sslcommerz/return?status=success`,
    fail_url: `${siteUrl}/api/payments/sslcommerz/return?status=fail`,
    cancel_url: `${siteUrl}/api/payments/sslcommerz/return?status=cancel`,
    ipn_url: `${siteUrl}/api/webhooks/sslcommerz`,
    shipping_method: "NO",
    product_name: input.productName,
    product_category: "digital",
    product_profile: "non-physical-goods",
    cus_name: input.name,
    cus_email: input.email,
    cus_add1: "Bangladesh",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: input.phone || "01700000000",
  });

  const response = await fetch(`${baseUrl()}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!response.ok) return null;

  const json = (await response.json().catch(() => null)) as
    | { status?: string; GatewayPageURL?: string; failedreason?: string }
    | null;
  if (json?.status !== "SUCCESS" || !json.GatewayPageURL) {
    console.error("[sslcommerz] session failed", { reason: json?.failedreason });
    return null;
  }
  return json.GatewayPageURL;
}

type ValidationResponse = {
  status?: string;
  tran_id?: string;
  amount?: string;
  currency_type?: string;
  risk_level?: string;
};

/** Confirms a payment server-to-server before granting credits. */
export async function fulfillSslcommerz(valId: string): Promise<boolean> {
  const creds = credentials();
  const admin = createAdminClient();
  if (!creds || !admin || !valId) return false;

  const query = new URLSearchParams({
    val_id: valId,
    store_id: creds.storeId,
    store_passwd: creds.storePassword,
    format: "json",
  });
  const response = await fetch(`${baseUrl()}/validator/api/validationserverAPI.php?${query}`, { cache: "no-store" });
  if (!response.ok) return false;

  const result = (await response.json().catch(() => null)) as ValidationResponse | null;
  if (!result || (result.status !== "VALID" && result.status !== "VALIDATED") || !result.tran_id) return false;

  if (result.risk_level === "1") {
    console.warn("[sslcommerz] risky payment held for review", { tranId: result.tran_id });
    return false;
  }

  const { data: payment } = await admin
    .from("payments")
    .select("user_id, pack_id, credits, amount, currency, status")
    .eq("provider", "sslcommerz")
    .eq("provider_ref", result.tran_id)
    .maybeSingle();
  if (!payment) return false;
  if (payment.status === "paid") return true;

  const amountMatches = Math.abs(Number(result.amount) - Number(payment.amount)) < 0.01;
  if (!amountMatches || result.currency_type !== payment.currency) {
    console.error("[sslcommerz] amount mismatch", { tranId: result.tran_id });
    return false;
  }

  const { error } = await admin.rpc("grant_credits", {
    p_user: payment.user_id,
    p_provider: "sslcommerz",
    p_ref: result.tran_id,
    p_pack: payment.pack_id,
    p_credits: payment.credits,
    p_amount: payment.amount,
    p_currency: payment.currency,
  });
  if (error) {
    console.error("[sslcommerz] grant failed", { code: error.code });
    return false;
  }
  return true;
}