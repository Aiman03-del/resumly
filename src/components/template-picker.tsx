"use client";
import { motion } from "framer-motion";
import { templates } from "@/types/template";
import { Check } from "lucide-react";

function TemplatePreview({ id }: { id: string }) {
  if (id === "creative") {
    return (
      <div className="w-full aspect-3/4 bg-neutral-50 flex p-2 gap-1.5">
        <div className="w-[35%] bg-neutral-800 rounded-sm p-2 space-y-1.5">
          <div className="w-6 h-6 rounded-full bg-white/30 mb-2" />
          <div className="h-1.5 bg-white/40 rounded w-4/5" />
          <div className="h-1 bg-white/25 rounded w-3/5" />
          <div className="h-1 bg-white/25 rounded w-2/3 mt-3" />
          <div className="h-1 bg-white/25 rounded w-1/2" />
        </div>
        <div className="flex-1 space-y-2 p-1">
          <div className="h-1.5 bg-accent/60 rounded w-1/2" />
          <div className="h-1 bg-neutral-300 rounded w-full" />
          <div className="h-1 bg-neutral-300 rounded w-5/6" />
          <div className="h-1.5 bg-accent/60 rounded w-1/2 mt-3" />
          <div className="h-1 bg-neutral-300 rounded w-full" />
          <div className="h-1 bg-neutral-300 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (id === "classic") {
    return (
      <div className="w-full aspect-3/4 bg-neutral-50 p-3 flex flex-col items-center">
        <div className="h-2 bg-neutral-800 rounded w-2/3 mb-1" />
        <div className="h-1 bg-neutral-400 rounded w-1/2 mb-3" />
        <div className="w-full h-px bg-neutral-300 mb-3" />
        <div className="w-full space-y-1.5">
          <div className="h-1 bg-neutral-300 rounded w-1/3" />
          <div className="h-1 bg-neutral-200 rounded w-full" />
          <div className="h-1 bg-neutral-200 rounded w-5/6" />
        </div>
        <div className="w-full space-y-1.5 mt-3">
          <div className="h-1 bg-neutral-300 rounded w-1/3" />
          <div className="h-1 bg-neutral-200 rounded w-full" />
          <div className="h-1 bg-neutral-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (id === "minimal") {
    return (
      <div className="w-full aspect-3/4 bg-neutral-50 p-3">
        <div className="border-b border-neutral-300 pb-2 mb-3">
          <div className="h-2 bg-neutral-700 rounded w-3/5 mb-1.5" />
          <div className="h-1 bg-neutral-300 rounded w-2/3" />
        </div>
        <div className="space-y-1.5 mb-3">
          <div className="h-1 bg-neutral-300 rounded w-1/3" />
          <div className="h-1 bg-neutral-200 rounded w-full" />
          <div className="h-1 bg-neutral-200 rounded w-5/6" />
        </div>
        <div className="space-y-1.5">
          <div className="h-1 bg-neutral-300 rounded w-2/5" />
          <div className="h-1 bg-neutral-200 rounded w-full" />
          <div className="h-1 bg-neutral-200 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (id === "timeline") {
    return (
      <div className="w-full aspect-3/4 bg-neutral-50 p-3">
        <div className="h-1.5 bg-neutral-800 rounded w-2/5 mb-3" />
        <div className="pl-3 border-l-2 border-primary/30 space-y-2">
          <div className="relative"><span className="absolute -left-3.75 w-1.5 h-1.5 rounded-full bg-primary" /><div className="h-1 bg-neutral-300 rounded w-full" /></div>
          <div className="relative"><span className="absolute -left-3.75 w-1.5 h-1.5 rounded-full bg-primary" /><div className="h-1 bg-neutral-300 rounded w-4/5" /></div>
        </div>
      </div>
    );
  }

  if (id === "compact") {
    return (
      <div className="w-full aspect-3/4 bg-neutral-50 p-3 grid grid-cols-3 gap-1.5">
        <div className="col-span-2 space-y-1"><div className="h-1 bg-neutral-300 rounded w-full" /><div className="h-1 bg-neutral-300 rounded w-4/5" /></div>
        <div className="space-y-1"><div className="h-1 bg-primary/40 rounded w-full" /><div className="h-1 bg-primary/40 rounded w-3/5" /></div>
      </div>
    );
  }

  if (id === "bold") {
    return (
      <div className="w-full aspect-3/4 bg-neutral-50">
        <div className="h-8 bg-primary" />
        <div className="p-3 space-y-1.5">
          <div className="h-1 bg-neutral-300 rounded w-full" />
          <div className="h-1 bg-neutral-300 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (id === "elegant") {
    return (
      <div className="w-full aspect-3/4 bg-neutral-50 p-3 flex flex-col items-center">
        <div className="h-1.5 bg-neutral-800 rounded w-2/5 mb-1" />
        <div className="w-8 h-px bg-neutral-400 my-2" />
        <div className="h-1 bg-neutral-300 rounded w-3/5" />
      </div>
    );
  }

  if (id === "sidebar-pro") {
    return (
      <div className="w-full aspect-3/4 bg-neutral-50 flex p-2 gap-1.5">
        <div className="w-[32%] bg-white border border-neutral-200 rounded-sm p-1.5 space-y-1">
          <div className="w-5 h-5 rounded bg-neutral-300" />
          <div className="h-1 bg-neutral-400 rounded w-4/5" />
        </div>
        <div className="flex-1 space-y-1.5 p-1">
          <div className="h-1 bg-neutral-300 rounded w-full" />
          <div className="h-1 bg-neutral-300 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (id === "tech") {
    return (
      <div className="w-full aspect-3/4 bg-neutral-50 p-3 font-mono">
        <div className="h-1 bg-primary/50 rounded w-2/5 mb-2" />
        <div className="h-1 bg-neutral-300 rounded w-full mb-1" />
        <div className="h-1 bg-neutral-300 rounded w-3/5" />
      </div>
    );
  }

  return (
    <div className="w-full aspect-3/4 bg-neutral-50 p-3 space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b-2 border-primary/60">
        <div className="w-6 h-6 rounded-full bg-neutral-300" />
        <div className="space-y-1">
          <div className="h-1.5 bg-neutral-700 rounded w-16" />
          <div className="h-1 bg-neutral-300 rounded w-20" />
        </div>
      </div>
      <div className="h-1 bg-primary/50 rounded w-1/4" />
      <div className="h-1 bg-neutral-200 rounded w-full" />
      <div className="h-1 bg-neutral-200 rounded w-5/6" />
      <div className="h-1 bg-primary/50 rounded w-1/4 mt-2" />
      <div className="flex gap-1 flex-wrap">
        <div className="h-2.5 bg-primary/20 rounded-full w-8" />
        <div className="h-2.5 bg-primary/20 rounded-full w-10" />
        <div className="h-2.5 bg-primary/20 rounded-full w-6" />
      </div>
    </div>
  );
}

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
          <TemplatePreview id={template.id} />
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