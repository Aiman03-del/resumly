"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { ResumeRenderer } from "@/components/templates";
import { ScaledPreview } from "@/components/scaled-preview";
import { ResumeData } from "@/types/resume";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ResumeCard({
  id,
  displayName,
  updatedAt,
  templateId,
  accentColor,
  data,
}: {
  id: string;
  displayName: string;
  updatedAt: string;
  templateId: string;
  accentColor?: string;
  data: ResumeData;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete resume:", error);
      toast.error("Could not delete resume", { description: error.message });
      setDeleting(false);
      return;
    }
    toast.success("Resume deleted");
    router.refresh();
  }

  return (
    <div className="group relative min-w-0 p-4 sm:p-5 rounded-xl border border-border hover:border-primary transition-colors">
      <div className="absolute top-3 right-3 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <button
                type="button"
                className="p-1.5 rounded-lg bg-white shadow-md border border-border text-foreground/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-red-600"
                aria-label={`Delete ${displayName}`}
              >
                <Trash2 size={13} />
              </button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;{displayName}&quot;. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Link href={`/preview/${id}`} className="block focus-visible:outline-2 focus-visible:outline-primary">
        <div className="h-44 overflow-hidden rounded-lg border border-border bg-neutral-100 mb-3 pointer-events-none">
          <ScaledPreview>
            <ResumeRenderer templateId={templateId} data={data} accentColor={accentColor} />
          </ScaledPreview>
        </div>
        <p className="font-medium truncate pr-10">{displayName}</p>
        <p className="text-xs text-foreground/50 mt-1">Updated {updatedAt}</p>
      </Link>
    </div>
  );
}
