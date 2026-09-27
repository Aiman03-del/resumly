"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PolishButton({
  section,
  content,
  context,
  onPolished,
}: {
  section: string;
  content: unknown;
  context?: Record<string, unknown>;
  onPolished: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handlePolish() {
    setLoading(true);
    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, content, context }),
      });
      const data = (await res.json()) as { polished: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Polish request failed");
      onPolished(data.polished);
    } catch (error: unknown) {
      console.error("Polish request failed:", error);
      toast.error("Could not polish this section", {
        description: error instanceof Error ? error.message : "Please try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.button
      onClick={handlePolish}
      disabled={loading}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
      {loading ? "..." : "AI"}
    </motion.button>
  );
}