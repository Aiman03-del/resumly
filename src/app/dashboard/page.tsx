import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: resumes } = await supabase.from("resumes").select("*").order("updated_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Your Resumes</h1>
        <Link
          href="/builder/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-fg text-sm font-medium"
        >
          <Plus size={15} /> New Resume
        </Link>
      </div>

      {!resumes?.length ? (
        <div className="text-center py-24 text-foreground/50">
          <FileText size={32} className="mx-auto mb-3" />
          <p>No resumes yet — create your first one.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-5">
          {resumes.map((r) => (
            <Link
              key={r.id}
              href={`/builder/${r.id}`}
              className="p-5 rounded-xl border border-border hover:border-primary transition-colors"
            >
              <p className="font-medium">{r.title}</p>
              <p className="text-xs text-foreground/50 mt-1">
                Updated {new Date(r.updated_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}