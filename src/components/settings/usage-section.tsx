"use client";

import { useEffect, useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { AI_FEATURE_LABELS, AI_LIMITS, type AiRoute } from "@/lib/ai-limits";
import { SettingsCard } from "./settings-ui";
import { BuyCredits } from "./buy-credits";

type Usage = { available: boolean; used: Record<string, number>; credits?: number } | "error" | null;

const PAYMENT_MESSAGES: Record<string, { text: string; tone: string }> = {
  success: { text: "Payment received. Your credits will appear in a moment.", tone: "text-green-700" },
  pending: { text: "We're confirming your payment. Credits appear as soon as it clears.", tone: "text-foreground/70" },
  fail: { text: "The payment didn't go through. You have not been charged.", tone: "text-red-600" },
  cancel: { text: "Payment cancelled.", tone: "text-foreground/70" },
};

export function UsageSection({ paymentStatus }: { paymentStatus?: string }) {
  const [usage, setUsage] = useState<Usage>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setInterval> | undefined;

    async function load() {
      try {
        const response = await fetch("/api/account/usage", { cache: "no-store" });
        if (!response.ok) throw new Error("failed");
        const body = await response.json();
        if (!cancelled) setUsage(body);
      } catch {
        if (!cancelled) setUsage("error");
      }
    }

    void load();
    if (paymentStatus === "success" || paymentStatus === "pending") {
      timer = setInterval(() => {
        attempts += 1;
        if (attempts > 5) clearInterval(timer);
        else void load();
      }, 4000);
    }
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [paymentStatus]);

  const message = paymentStatus ? PAYMENT_MESSAGES[paymentStatus] : undefined;
  const credits = usage && usage !== "error" ? usage.credits ?? 0 : 0;

  return (
    <div className="space-y-6">
      {message && <p className={`rounded-xl border border-border px-4 py-3 text-sm ${message.tone}`}>{message.text}</p>}

      <SettingsCard title="AI usage today" description="Each AI feature has a free daily limit per account. Counters reset every day.">
        {usage === null && (
          <p className="flex items-center gap-2 text-sm text-foreground/60"><Loader2 size={15} className="animate-spin" /> Loading usage…</p>
        )}
        {usage === "error" && <p className="text-sm text-red-600">Could not load your usage. Please refresh the page.</p>}
        {usage && usage !== "error" && (
          <>
            {!usage.available && (
              <p className="text-sm text-foreground/60 mb-4">Live usage isn&apos;t available right now, so the counters below may be inaccurate. The daily limits still apply.</p>
            )}
            <ul className="space-y-4">
              {(Object.keys(AI_LIMITS) as AiRoute[]).map((route) => {
                const limit = AI_LIMITS[route];
                const used = Math.min(usage.used[route] ?? 0, limit);
                const percent = Math.round((used / limit) * 100);
                const nearLimit = percent >= 80;
                return (
                  <li key={route}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium">{AI_FEATURE_LABELS[route]}</span>
                      <span className={nearLimit ? "text-red-600 font-medium" : "text-foreground/60"}>{used} / {limit}</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`${AI_FEATURE_LABELS[route]} usage`}
                      aria-valuemin={0}
                      aria-valuemax={limit}
                      aria-valuenow={used}
                      className="h-2 rounded-full bg-neutral-200 overflow-hidden"
                    >
                      <div className={`h-full rounded-full transition-all ${nearLimit ? "bg-red-500" : "bg-primary"}`} style={{ width: `${percent}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </SettingsCard>

      <SettingsCard
        title="AI credits"
        description="When you use up a free daily limit, each extra AI request uses 1 credit. Credits never expire."
      >
        <div className="mb-6 flex items-center gap-4 rounded-xl bg-muted px-5 py-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Coins size={22} />
          </span>
          <div>
            <p className="text-3xl font-bold leading-none">{usage === null ? "–" : credits}</p>
            <p className="mt-1 text-sm text-foreground/60">credits available</p>
          </div>
        </div>
        <BuyCredits />
      </SettingsCard>
    </div>
  );
}