"use client";
import { motion } from "framer-motion";
import { Sparkles, LayoutTemplate, Download } from "lucide-react";

const features = [
  { icon: Sparkles, title: "AI Polishing", desc: "Every section refined by AI for maximum impact" },
  { icon: LayoutTemplate, title: "Pro Templates", desc: "Choose from designer-made, ATS-friendly layouts" },
  { icon: Download, title: "Instant PDF", desc: "Export a polished resume in one click" },
];

export function Features() {
  return (
    <section className="grid sm:grid-cols-3 gap-6 pb-24">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          className="p-6 rounded-2xl border border-border bg-muted/30"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
            <feature.icon size={18} />
          </div>
          <h3 className="font-semibold mb-1.5">{feature.title}</h3>
          <p className="text-sm text-foreground/60">{feature.desc}</p>
        </motion.div>
      ))}
    </section>
  );
}