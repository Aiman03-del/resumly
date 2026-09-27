"use client";
import { Sparkles } from "lucide-react";

export function BeforeAfter() {
  return (
    <section className="pb-24">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">See the AI difference</h2>
        <p className="text-foreground/60 max-w-md mx-auto">
          One click turns a flat bullet point into something a recruiter actually notices.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">
        <div className="p-6 rounded-2xl border border-border bg-muted/20">
          <span className="text-xs font-medium text-foreground/40 uppercase tracking-wide">Before</span>
          <p className="text-sm mt-3 text-foreground/70">
            Responsible for managing social media accounts and posting content.
          </p>
        </div>
        <div className="p-6 rounded-2xl border-2 border-primary/40 bg-primary/5 relative">
          <span className="absolute -top-3 left-5 text-[10px] font-semibold bg-primary text-primary-fg px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={10} /> AI Polished
          </span>
          <span className="text-xs font-medium text-foreground/40 uppercase tracking-wide">After</span>
          <p className="text-sm mt-3">
            Grew social media following by 40% in 6 months by planning and publishing a
            consistent content calendar across 3 platforms.
          </p>
        </div>
      </div>
    </section>
  );
}