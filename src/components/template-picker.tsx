"use client";
import { motion } from "framer-motion";
import { templates } from "@/types/template";
import { Check } from "lucide-react";

export function TemplatePicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {templates.map((template) => (
        <motion.button
          key={template.id}
          onClick={() => onSelect(template.id)}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className={`relative rounded-xl border-2 overflow-hidden text-left transition-colors ${
            selected === template.id ? "border-primary" : "border-border"
          }`}
        >
          <img src={template.thumbnail} alt={template.name} className="w-full aspect-[3/4] object-cover" />
          {selected === template.id && (
            <div className="absolute top-2 right-2 bg-primary text-primary-fg rounded-full p-1">
              <Check size={16} />
            </div>
          )}
          <div className="p-3 bg-background">
            <p className="font-medium">{template.name}</p>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}