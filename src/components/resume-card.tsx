"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pencil, Trash2 } from "lucide-react";
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
}: {
  id: string;
  displayName: string;
  updatedAt: string;
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
    <div className="group relative p-5 rounded-xl border border-border hover:border-primary transition-colors">
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        <Link
          href={`/builder/${id}`}
          className="p-1.5 rounded-lg bg-muted hover:bg-border focus-visible:outline-2 focus-visible:outline-primary"
          aria-label={`Edit ${displayName}`}
        >
          <Pencil size={13} />
        </Link>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <button
                type="button"
                className="p-1.5 rounded-lg bg-muted hover:bg-red-100 hover:text-red-600 cursor-pointer focus-visible:outline-2 focus-visible:outline-red-600"
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

      <Link href={`/preview/${id}`} className="block pr-16 focus-visible:outline-2 focus-visible:outline-primary">
        <p className="font-medium">{displayName}</p>
        <p className="text-xs text-foreground/50 mt-1">Updated {updatedAt}</p>
      </Link>
    </div>
  );
}
