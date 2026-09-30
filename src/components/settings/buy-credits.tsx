"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CREDIT_PACKS, type CreditPack } from "@/lib/credit-packs";

type Currency = "BDT" | "USD";
type Provider = "sslcommerz" | "lemonsqueezy";

const PROVIDER_BY_CURRENCY: Record<Currency, Provider> = {
  BDT: "sslcommerz",
  USD: "lemonsqueezy",
};

const METHODS: Record<Currency, string> = {
  BDT: "bKash, Nagad or card",
  USD: "card or PayPal",
};

const CURRENCIES: { id: Currency; label: string }[] = [
  { id: "BDT", label: "৳ BDT" },
  { id: "USD", label: "$ USD" },
];

function price(pack: CreditPack, currency: Currency) {
  return currency === "BDT" ? pack.priceBdt : pack.priceUsd;
}

function priceLabel(pack: CreditPack, currency: Currency) {
  return currency === "BDT" ? `৳${pack.priceBdt}` : `$${pack.priceUsd}`;
}

function perCredit(pack: CreditPack, currency: Currency) {
  return price(pack, currency) / pack.credits;
}

function perCreditLabel(pack: CreditPack, currency: Currency) {
  const value = perCredit(pack, currency);
  return currency === "BDT" ? `৳${value.toFixed(2)}` : `$${value.toFixed(3)}`;
}

function savingsPercent(pack: CreditPack, currency: Currency) {
  const base = perCredit(CREDIT_PACKS[0], currency);
  return Math.round((1 - perCredit(pack, currency) / base) * 100);
}

export function BuyCredits() {
  const [currency, setCurrency] = useState<Currency>("BDT");
  const [busy, setBusy] = useState<string | null>(null);

  async function buy(packId: string) {
    setBusy(packId);
    try {
      const response = await fetch(`/api/checkout/${PROVIDER_BY_CURRENCY[currency]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error ?? "Could not start the payment.");
      window.location.assign(body.url);
    } catch (error) {
      toast.error("Could not start the payment", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Buy more credits</p>
        <div
          role="radiogroup"
          aria-label="Currency"
          className="inline-flex rounded-full border border-border bg-muted p-1 text-xs sm:text-sm"
        >
          {CURRENCIES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={currency === item.id}
              disabled={busy !== null}
              onClick={() => setCurrency(item.id)}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors disabled:opacity-60 ${
                currency === item.id
                  ? "bg-background shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {CREDIT_PACKS.map((pack) => {
          const popular = pack.id === "standard";
          const savings = savingsPercent(pack, currency);
          const loading = busy === pack.id;

          return (
            <div
              key={pack.id}
              className={`relative flex flex-col rounded-xl border p-4 ${
                popular ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-primary">{pack.label}</p>
                {popular ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-fg">
                    Popular
                  </span>
                ) : (
                  savings > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Save {savings}%
                    </span>
                  )
                )}
              </div>

              <p className="text-3xl font-bold leading-none">{pack.credits}</p>
              <p className="mt-1 text-xs text-foreground/60">AI credits</p>

              {popular && savings > 0 && (
                <p className="mt-2 text-xs font-medium text-primary">Save {savings}%</p>
              )}

              <p className="mb-4 mt-3 text-xs text-foreground/50">
                {perCreditLabel(pack, currency)} per credit
              </p>

              <button
                type="button"
                disabled={busy !== null}
                onClick={() => buy(pack.id)}
                className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition disabled:opacity-60 ${
                  popular
                    ? "bg-primary text-primary-fg hover:opacity-90"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Buy for {priceLabel(pack, currency)}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-foreground/50">
        Pay with {METHODS[currency]}. One-time payment, no subscription.
      </p>
    </div>
  );
}
