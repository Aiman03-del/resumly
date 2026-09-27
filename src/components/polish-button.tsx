"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MAX_ATTEMPTS = 3;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function PolishButton({
  section,
  content,
  context,
  onPolished,
  onLoadingChange,
}: {
  section: string;
  content: unknown;
  context?: Record<string, unknown>;
  onPolished: (text: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handlePolish() {
    setLoading(true);
    onLoadingChange?.(true);

    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch("/api/polish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, content, context }),
        });
        const data = (await response.json()) as { polished: string; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Polish request failed");
        if (!data.polished?.trim()) throw new Error("Got an empty response");

        onPolished(data.polished);
        setLoading(false);
        onLoadingChange?.(false);
        return;
      } catch (error: unknown) {
        lastError = error;
        if (attempt < MAX_ATTEMPTS) await delay(attempt * 600);
      }
    }

    console.error("Polish request failed after retries:", lastError);
    toast.error("Could not polish this section", {
      description: lastError instanceof Error ? lastError.message : "Please try again in a moment.",
    });
      setLoading(false);
    onLoadingChange?.(false);
  }

  return (
    <motion.button
      type="button"
      onClick={handlePolish}
      disabled={loading}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
      {loading ? "Generating..." : "AI"}
    </motion.button>
  );
}