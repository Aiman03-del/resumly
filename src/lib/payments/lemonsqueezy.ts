import { createHmac, timingSafeEqual } from "node:crypto";
import { CREDIT_PACKS, type CreditPack } from "@/lib/credit-packs";

/** Variant id for a pack, read from LEMONSQUEEZY_VARIANT_<PACK_ID>. */
export function variantIdForPack(pack: CreditPack): string | undefined {
  return process.env[`LEMONSQUEEZY_VARIANT_${pack.id.toUpperCase()}`];
}

export function packForVariant(variantId: string | number | undefined): CreditPack | undefined {
  if (variantId === undefined) return undefined;
  return CREDIT_PACKS.find((pack) => variantIdForPack(pack) === String(variantId));
}

export function verifyLemonSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}