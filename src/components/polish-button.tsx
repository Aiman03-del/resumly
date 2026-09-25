"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";

export function PolishButton({
  section,
  content,
  onPolished,
}: {
  section: string;
  content: unknown;
  onPolished: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handlePolish() {
    setLoading(true);
    const res = await fetch("/api/polish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, content }),
    });
    const data = await res.json();
    onPolished(data.polished);
    setLoading(false);
  }

  return (
    <motion.button
      onClick={handlePolish}
      disabled={loading}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      {loading ? "Polishing..." : "Polish with AI"}
    </motion.button>
  );
}