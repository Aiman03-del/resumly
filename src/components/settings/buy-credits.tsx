"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CREDIT_PACKS } from "@/lib/credit-packs";

type Provider = "sslcommerz" | "lemonsqueezy";

export function BuyCredits() {
  const [busy, setBusy] = useState<string | null>(null);

  async function buy(provider: Provider, packId: string) {
    setBusy(`${provider}:${packId}`);
    try {
      const response = await fetch(`/api/checkout/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error ?? "Could not start the payment.");
      window.location.href = body.url;
    } catch (error) {
      toast.error("Could not start the payment", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
      setBusy(null);
    }
  }

  function PayButton({ provider, packId, children }: { provider: Provider; packId: string; children: string }) {
    const loading = busy === `${provider}:${packId}`;
    return (
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => buy(provider, packId)}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors disabled:opacity-60"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {children}
      </button>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {CREDIT_PACKS.map((pack) => (
        <div key={pack.id} className="rounded-xl border border-border p-4 flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-primary">{pack.label}</p>
            <p className="text-2xl font-bold">{pack.credits}</p>
            <p className="text-xs text-foreground/60">AI credits</p>
          </div>
          <div className="mt-auto space-y-2">
            <PayButton provider="sslcommerz" packId={pack.id}>{`৳${pack.priceBdt} · bKash / Nagad / Card`}</PayButton>
            <PayButton provider="lemonsqueezy" packId={pack.id}>{`$${pack.priceUsd} · Card / PayPal`}</PayButton>
          </div>
        </div>
      ))}
    </div>
  );
}