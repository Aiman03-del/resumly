"use client";
import { useState } from "react";
import { GripVertical } from "lucide-react";
import { SECTION_LABELS, type SectionKey } from "@/lib/section-order";

export function SectionOrderList({
  order,
  onChange,
}: {
  order: SectionKey[];
  onChange: (order: SectionKey[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...order];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-medium mb-1">Section order</p>
      <p className="text-xs text-muted-foreground mb-3">
        Drag to reorder. Templates with a sidebar (e.g. Creative, Sidebar Pro) reorder that
        column and the main column independently.
      </p>
      <ul className="space-y-1.5">
        {order.map((key, index) => (
          <li
            key={key}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => {
              event.preventDefault();
              if (overIndex !== index) setOverIndex(index);
            }}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm select-none cursor-grab active:cursor-grabbing transition-colors ${
              dragIndex === index
                ? "opacity-40 border-primary"
                : overIndex === index
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
            }`}
          >
            <GripVertical size={14} className="text-muted-foreground shrink-0" />
            {SECTION_LABELS[key]}
          </li>
        ))}
      </ul>
    </div>
  );
}
