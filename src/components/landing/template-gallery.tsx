"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { TemplateThumbnail } from "@/components/template-thumbnail";
import { TemplatePreviewModal } from "./template-preview-modal";

const templates = [
  { id: "modern", name: "Modern" },
  { id: "creative", name: "Creative" },
  { id: "classic", name: "Classic" },
  { id: "minimal", name: "Minimal" },
  { id: "timeline", name: "Timeline" },
  { id: "compact", name: "Compact" },
  { id: "bold", name: "Bold" },
  { id: "elegant", name: "Elegant" },
  { id: "sidebar-pro", name: "Sidebar Pro" },
  { id: "tech", name: "Tech" },
];

export function TemplateGallery() {
  const [preview, setPreview] = useState<{ id: string; name: string } | null>(null);

  return (
    <section className="pb-24">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">10 templates to choose from</h2>
        <p className="text-foreground/60 max-w-md mx-auto">
          Every layout is clean, ATS-friendly, and free to use — swap between them anytime.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {templates.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
          >
            <button
              onClick={() => setPreview({ id: t.id, name: t.name })}
              className="group block w-full text-left rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors bg-white"
            >
              <TemplateThumbnail id={t.id} className="bg-neutral-100" />
              <div className="px-3 py-2.5 text-sm font-medium border-t border-border group-hover:text-primary transition-colors">
                {t.name}
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {preview && (
        <TemplatePreviewModal
          templateId={preview.id}
          templateName={preview.name}
          onClose={() => setPreview(null)}
        />
      )}
    </section>
  );
}