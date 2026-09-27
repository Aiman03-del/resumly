"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, content }),
      });
      if (!res.ok) throw new Error("Polish request failed");

      const data = await res.json();
      onPolished(data.polished);
    } catch (error) {
      console.error("Polish request failed:", error);
      toast.error("Could not polish this section", {
        description: "Please try again in a moment.",
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
      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      {loading ? "Polishing..." : "Polish with AI"}
    </motion.button>
  );
}