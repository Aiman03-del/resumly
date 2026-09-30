// @vitest-environment node
import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CREDIT_PACKS } from "@/lib/credit-packs";
import { packForVariant, verifyLemonSignature } from "./lemonsqueezy";

const rawBody = '{"meta":{"event_name":"order_created"}}';
const secret = "webhook-secret";

function signatureFor(body: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

describe("Lemon Squeezy helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a valid signature and rejects missing or modified signatures", () => {
    const signature = signatureFor(rawBody);

    expect(verifyLemonSignature(rawBody, signature, secret)).toBe(true);
    expect(verifyLemonSignature(rawBody, null, secret)).toBe(false);
    expect(verifyLemonSignature(`${rawBody} `, signature, secret)).toBe(false);
    expect(verifyLemonSignature(rawBody, "invalid", secret)).toBe(false);
  });

  it("maps configured variant ids to their server-defined credit pack", () => {
    vi.stubEnv("LEMONSQUEEZY_VARIANT_STANDARD", "variant-200");

    expect(packForVariant("variant-200")).toEqual(CREDIT_PACKS[1]);
    expect(packForVariant("unknown")).toBeUndefined();
    expect(packForVariant(undefined)).toBeUndefined();
  });
});