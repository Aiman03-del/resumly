"use client";
import { motion } from "framer-motion";

const stats = [
  { value: "10", label: "Designer templates" },
  { value: "100%", label: "Free to use" },
  { value: "AI", label: "Powered writing help" },
  { value: "<5 min", label: "To a finished resume" },
];

export function StatsStrip() {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-10 border-y border-border mb-24">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          className="text-center"
        >
          <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
          <div className="text-xs sm:text-sm text-foreground/60 mt-1">{stat.label}</div>
        </motion.div>
      ))}
    </section>
  );
}