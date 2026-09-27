"use client";
import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ResumeRenderer } from "@/components/templates";
import { sampleResumeData } from "@/lib/sample-resume";

export function TemplatePreviewModal({
  templateId,
  templateName,
  onClose,
}: {
  templateId: string;
  templateName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(event) => event.stopPropagation()}
          className="bg-background rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <span className="font-medium">{templateName} template</span>
            <button onClick={onClose} className="text-foreground/50 hover:text-foreground">
              <X size={18} />
            </button>
          </div>
          <div className="overflow-y-auto p-6 bg-muted/20">
            <div className="shadow-lg mx-auto max-w-[600px]">
              <ResumeRenderer templateId={templateId} data={sampleResumeData} />
            </div>
          </div>
          <div className="px-5 py-4 border-t border-border shrink-0">
            <Link
              href="/builder/new"
              className="block text-center px-6 py-2.5 rounded-full bg-primary text-primary-fg font-medium hover:opacity-90 transition-opacity"
            >
              Use this template
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}