"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Loader2, Pencil, Trash2 } from "lucide-react";
import { ResumeRenderer } from "@/components/templates";
import { ScaledPreview } from "@/components/scaled-preview";
import { VersionNameDialog } from "@/components/version-name-dialog";
import type { ResumeData } from "@/types/resume";
import { createClient } from "@/lib/supabase/client";
import { duplicateResume, renameResume, suggestCopyTitle } from "@/lib/resume-version";
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

const iconButton =
  "p-1.5 rounded-lg bg-white shadow-md border border-border text-foreground/60 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function ResumeCard({
  id,
  displayName,
  subtitle,
  updatedAt,
  templateId,
  accentColor,
  data,
}: {
  id: string;
  displayName: string;
  subtitle?: string;
  updatedAt: string;
  templateId: string;
  accentColor?: string;
  data: ResumeData;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);

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

  async function handleRename(name: string) {
    try {
      await renameResume(supabase, id, name);
      setRenameOpen(false);
      toast.success("Version renamed");
      router.refresh();
    } catch (error) {
      toast.error("Could not rename", { description: errorMessage(error) });
    }
  }

  async function handleDuplicate(name: string) {
    try {
      const newId = await duplicateResume(supabase, id, name);
      setDuplicateOpen(false);
      router.refresh();
      toast.success(`Created "${name}"`, {
        action: { label: "Edit", onClick: () => router.push(`/builder/${newId}`) },
      });
    } catch (error) {
      toast.error("Could not create the version", { description: errorMessage(error) });
    }
  }

  return (
    <div className="group relative min-w-0 p-4 sm:p-5 rounded-xl border border-border hover:border-primary transition-colors">
      <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setRenameOpen(true)}
          className={`${iconButton} hover:bg-muted`}
          aria-label={`Rename ${displayName}`}
          title="Rename"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          onClick={() => setDuplicateOpen(true)}
          className={`${iconButton} hover:bg-muted`}
          aria-label={`Save ${displayName} as a new version`}
          title="Save as new version"
        >
          <Copy size={13} />
        </button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <button
                type="button"
                className={`${iconButton} hover:bg-red-50 hover:text-red-600 hover:border-red-200 focus-visible:outline-red-600`}
                aria-label={`Delete ${displayName}`}
                title="Delete"
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
        {subtitle && <p className="text-xs text-foreground/60 truncate mt-0.5">{subtitle}</p>}
        <p className="text-xs text-foreground/50 mt-1">Updated {updatedAt}</p>
      </Link>

      <VersionNameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename this version"
        description="Give it a name that tells you what it is for, like a job title."
        initialValue={displayName}
        confirmLabel="Save"
        onSubmit={handleRename}
      />
      <VersionNameDialog
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
        title="Save as a new version"
        description="This makes an independent copy you can tailor for a different role. The original stays unchanged."
        initialValue={suggestCopyTitle(displayName)}
        confirmLabel="Create copy"
        onSubmit={handleDuplicate}
      />
    </div>
  );
}
