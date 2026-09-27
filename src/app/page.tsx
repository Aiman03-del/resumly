"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, LayoutTemplate, Download } from "lucide-react";
import { HeroTemplateCarousel } from "@/components/hero-template-carousel";

const features = [
  { icon: Sparkles, title: "AI Polishing", desc: "Every section refined by AI for maximum impact" },
  { icon: LayoutTemplate, title: "Pro Templates", desc: "Choose from designer-made, ATS-friendly layouts" },
  { icon: Download, title: "Instant PDF", desc: "Export a polished resume in one click" },
];

export default function LandingPage() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <section className="flex flex-col lg:flex-row items-center gap-10 lg:gap-8 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 text-center lg:text-left"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-accent/10 text-accent px-3 py-1 rounded-full mb-5">
            <Sparkles size={12} /> AI-Powered Resume Builder
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
            Build a resume that <span className="text-primary">gets you hired</span>
          </h1>
          <p className="text-foreground/60 max-w-md mx-auto lg:mx-0 mb-8">
            Fill in your details, pick a template, and let AI polish every section —
            all in a few minutes.
          </p>
          <Link
            href="/builder/new"
            className="inline-block px-6 py-3 rounded-full bg-primary text-primary-fg font-medium hover:opacity-90 transition-opacity"
          >
            Start Building — Free
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 w-full"
        >
          <HeroTemplateCarousel />
        </motion.div>
      </section>

      <section className="grid sm:grid-cols-3 gap-6 pb-24">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="p-6 rounded-2xl border border-border bg-muted/30"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <f.icon size={18} />
            </div>
            <h3 className="font-semibold mb-1.5">{f.title}</h3>
            <p className="text-sm text-foreground/60">{f.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}