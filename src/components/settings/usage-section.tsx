"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AI_FEATURE_LABELS, AI_LIMITS, type AiRoute } from "@/lib/ai-limits";
import { SettingsCard } from "./settings-ui";

type Usage = { available: boolean; used: Record<string, number> } | "error" | null;

export function UsageSection() {
  const [usage, setUsage] = useState<Usage>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/usage", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("failed")))
      .then((body) => !cancelled && setUsage(body))
      .catch(() => !cancelled && setUsage("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SettingsCard title="AI usage today" description="Each AI feature has a daily limit per account. Counters reset every day.">
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
  );
}