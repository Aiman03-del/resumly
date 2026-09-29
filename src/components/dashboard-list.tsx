"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search, Trash2 } from "lucide-react";
import { ResumeCard } from "@/components/resume-card";
import type { ResumeData } from "@/types/resume";

export type DashboardItem = {
  id: string;
  displayName: string;
  subtitle?: string;
  role?: string;
  updatedAt: string;
  updatedLabel: string;
  templateId: string;
  accentColor?: string;
  completion: number;
  deletedAt: string | null;
  data: ResumeData;
};

type SortKey = "recent" | "oldest" | "name" | "completion";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recently edited" },
  { value: "oldest", label: "Oldest edited" },
  { value: "name", label: "Name (A–Z)" },
  { value: "completion", label: "Most complete" },
];

export function DashboardList({ items }: { items: DashboardItem[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<"active" | "trash">("active");

  const activeCount = items.filter((item) => !item.deletedAt).length;
  const trashCount = items.length - activeCount;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = items.filter((item) => {
      if (view === "active" ? item.deletedAt : !item.deletedAt) return false;
      if (!needle) return true;
      return [item.displayName, item.subtitle, item.role]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle));
    });

    return list.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.updatedAt.localeCompare(b.updatedAt);
        case "name":
          return a.displayName.localeCompare(b.displayName);
        case "completion":
          return b.completion - a.completion;
        default:
          return b.updatedAt.localeCompare(a.updatedAt);
      }
    });
  }, [items, query, sort, view]);

  const tab = (key: "active" | "trash", label: string, count: number) => (
    <button
      type="button"
      onClick={() => setView(key)}
      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
        view === key ? "bg-primary text-primary-fg" : "text-foreground/60 hover:bg-muted"
      }`}
    >
      {label} <span className="opacity-70">({count})</span>
    </button>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex gap-1.5">
          {tab("active", "Resumes", activeCount)}
          {tab("trash", "Trash", trashCount)}
        </div>

        <div className="flex flex-1 gap-2 sm:justify-end">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search resumes…"
              aria-label="Search resumes"
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label="Sort resumes"
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {view === "trash" && trashCount > 0 && (
        <p className="text-xs text-foreground/50 mb-4">
          Resumes in the trash can be restored or deleted permanently.
        </p>
      )}

      {visible.length === 0 ? (
        <div className="text-center py-24 text-foreground/50">
          {view === "trash" ? <Trash2 size={32} className="mx-auto mb-3" /> : <FileText size={32} className="mx-auto mb-3" />}
          <p>
            {query
              ? `No resumes match “${query}”.`
              : view === "trash"
                ? "Trash is empty."
                : "No resumes yet — create your first one."}
          </p>
          {view === "active" && !query && (
            <Link
              href="/builder/new"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full bg-primary text-primary-fg text-sm font-medium"
            >
              <Plus size={15} /> New Resume
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {visible.map((item) => (
            <ResumeCard
              key={item.id}
              id={item.id}
              displayName={item.displayName}
              subtitle={item.subtitle}
              updatedAt={item.updatedLabel}
              templateId={item.templateId}
              accentColor={item.accentColor}
              completion={item.completion}
              trashed={Boolean(item.deletedAt)}
              data={item.data}
            />
          ))}
        </div>
      )}
    </>
  );
}