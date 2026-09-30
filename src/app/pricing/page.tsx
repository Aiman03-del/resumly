import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  Check,
  ChevronDown,
  Coins,
  FileCheck,
  Link2,
  Mail,
  Sparkles,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { CREDIT_PACKS } from "@/lib/credit-packs";
import { AI_LIMITS, AI_FEATURE_LABELS, type AiRoute } from "@/lib/ai-limits";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Resumly is free to use. Buy AI credits once if you need more AI requests.",
};

const FREE_FEATURES = [
  "10 resume templates",
  "Custom colors and section order",
  "Profile photo upload",
  "Download as PDF",
  "Share with a public link",
  "Free daily AI requests",
];

const PACK_FEATURES = [
  "Works with every AI feature",
  "Credits never expire",
  "One-time payment, no subscription",
];

const AI_ICONS: Record<AiRoute, LucideIcon> = {
  polish: Sparkles,
  ats: FileCheck,
  "job-match": Target,
  "cover-letter": Mail,
  "project-link": Link2,
};

const AI_ROUTES = Object.keys(AI_LIMITS) as AiRoute[];

const STEPS = [
  {
    icon: CalendarClock,
    title: "Use your free daily limit",
    text: "Every AI feature has a free limit that resets each day.",
  },
  {
    icon: Zap,
    title: "Credits take over",
    text: "Once you pass a limit, each extra AI request uses 1 credit.",
  },
  {
    icon: Coins,
    title: "They never expire",
    text: "Buy once and use your credits whenever you need them.",
  },
];

const FAQS = [
  {
    q: "Do I need credits to build or download a resume?",
    a: "No. Building resumes, using templates and downloading PDFs is always free. Credits are only used for AI requests after you pass the free daily limit.",
  },
  {
    q: "Do credits expire?",
    a: "No. Your credits stay in your account until you use them.",
  },
  {
    q: "Which payment methods can I use?",
    a: "You can pay in BDT with bKash, Nagad or a card, or in USD with a card or PayPal.",
  },
  {
    q: "Is this a subscription?",
    a: "No. Every pack is a one-time payment. Nothing renews automatically.",
  },
];

const basePerCredit = CREDIT_PACKS[0].priceBdt / CREDIT_PACKS[0].credits;

export default function PricingPage() {
  return (
    <div className="relative">
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground/70 mb-5">
            <Sparkles size={12} className="text-primary" />
            Simple pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">
            Free to build. Pay only for extra AI.
          </h1>
          <p className="text-foreground/60 text-base sm:text-lg">
            Everything you need to make a great resume is free. If you use AI a lot, grab a credit
            pack once and keep it forever.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch mb-20">
          <div className="flex flex-col rounded-2xl border border-border p-6">
            <p className="text-sm font-medium text-foreground/70">Free</p>
            <div className="mt-3 mb-1 flex items-baseline gap-1">
              <span className="text-4xl font-bold">$0</span>
            </div>
            <p className="text-sm text-foreground/60 mb-6">Forever, no card needed.</p>

            <ul className="space-y-3 mb-8 text-sm">
              {FREE_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check size={12} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/builder/new"
              className="mt-auto block rounded-full border border-border px-5 py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted"
            >
              Get started
            </Link>
          </div>

          {CREDIT_PACKS.map((pack) => {
            const popular = pack.id === "standard";
            const perCredit = pack.priceBdt / pack.credits;
            const savings = Math.round((1 - perCredit / basePerCredit) * 100);

            return (
              <div
                key={pack.id}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  popular
                    ? "border-primary shadow-lg shadow-primary/10 lg:-translate-y-2"
                    : "border-border"
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-fg">
                    Most popular
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary">{pack.label}</p>
                  {savings > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Save {savings}%
                    </span>
                  )}
                </div>

                <div className="mt-3 mb-1 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">৳{pack.priceBdt}</span>
                </div>
                <p className="text-sm text-foreground/60 mb-1">or ${pack.priceUsd} USD</p>
                <p className="text-xs text-foreground/50 mb-6">৳{perCredit.toFixed(2)} per credit</p>

                <div className="mb-6 rounded-xl bg-muted px-4 py-3">
                  <p className="text-2xl font-bold leading-none">{pack.credits}</p>
                  <p className="mt-1 text-xs text-foreground/60">AI credits</p>
                </div>

                <ul className="space-y-3 mb-8 text-sm">
                  {PACK_FEATURES.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check size={12} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/settings?tab=usage"
                  className={`mt-auto block rounded-full px-5 py-2.5 text-center text-sm font-medium transition-opacity ${
                    popular
                      ? "bg-primary text-primary-fg hover:opacity-90"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  Buy {pack.label}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">How credits work</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon size={20} />
                  </span>
                  <span className="text-xs font-medium text-foreground/40">Step {index + 1}</span>
                </div>
                <p className="mb-1 font-semibold">{step.title}</p>
                <p className="text-sm text-foreground/60">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Free daily AI limits</h2>
            <p className="text-sm text-foreground/60">Included with every account, reset every day.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {AI_ROUTES.map((route) => {
              const Icon = AI_ICONS[route];
              return (
                <div key={route} className="rounded-2xl border border-border p-5 text-center">
                  <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary">
                    <Icon size={18} />
                  </span>
                  <p className="text-2xl font-bold">{AI_LIMITS[route]}</p>
                  <p className="text-xs text-foreground/50 mb-2">per day</p>
                  <p className="text-sm font-medium">{AI_FEATURE_LABELS[route]}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Questions</h2>
          <div className="space-y-3">
            {FAQS.map((item) => (
              <details key={item.q} className="group rounded-xl border border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium sm:text-base [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-foreground/50 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-4 text-sm text-foreground/60">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-primary px-8 py-14 text-center text-primary-fg">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">Start with the free plan</h2>
          <p className="mx-auto mb-8 max-w-md opacity-80">
            Build your resume today. Add credits later only if you need more AI help.
          </p>
          <Link
            href="/builder/new"
            className="inline-block rounded-full bg-primary-fg px-6 py-3 font-medium text-primary transition-opacity hover:opacity-90"
          >
            Start Building — Free
          </Link>
        </div>
      </div>
    </div>
  );
}
