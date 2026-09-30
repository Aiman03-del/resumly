"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/password-input";
import { Field, inputClass, SaveButton, SettingsCard } from "./settings-ui";

export function DataSection({ email }: { email: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [trashCount, setTrashCount] = useState<number | null>(null);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [emptying, setEmptying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .not("deleted_at", "is", null)
      .then(({ count }) => !cancelled && setTrashCount(count ?? 0));
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function emptyTrash() {
    setEmptying(true);
    const { error } = await supabase.from("resumes").delete().not("deleted_at", "is", null);
    setEmptying(false);
    setConfirmEmpty(false);
    if (error) {
      toast.error("Could not empty the trash", { description: "Please try again." });
      return;
    }
    setTrashCount(0);
    toast.success("Trash emptied");
  }

  async function exportData() {
    setExporting(true);
    try {
      const [{ data: resumes, error }, { data: userData }] = await Promise.all([
        supabase.from("resumes").select("*").order("created_at", { ascending: true }),
        supabase.auth.getUser(),
      ]);
      if (error) throw error;
      const payload = {
        exportedAt: new Date().toISOString(),
        account: { email, profile: userData.user?.user_metadata ?? {} },
        resumes: resumes ?? [],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resumly-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Your data was downloaded");
    } catch {
      toast.error("Could not export your data", { description: "Please try again." });
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setDeleteError(body?.error ?? "We couldn't delete your account. Please try again.");
        return;
      }
      await supabase.auth.signOut().catch(() => undefined);
      window.dispatchEvent(new Event("resumly-auth-changed"));
      toast.success("Your account was deleted");
      router.push("/");
      router.refresh();
    } catch {
      setDeleteError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Trash" description="Deleted resumes stay in the trash until you empty it. You can restore them from your dashboard.">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-foreground/70">{trashCount === null ? "Checking…" : `${trashCount} resume${trashCount === 1 ? "" : "s"} in the trash`}</p>
          <Link href="/dashboard" className="text-sm text-primary font-medium hover:underline">Open dashboard</Link>
        </div>
        {trashCount ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {!confirmEmpty ? (
              <SaveButton variant="outline" onClick={() => setConfirmEmpty(true)}><Trash2 size={14} /> Empty trash</SaveButton>
            ) : (
              <>
                <SaveButton variant="danger" onClick={() => void emptyTrash()} loading={emptying}>Yes, delete {trashCount} permanently</SaveButton>
                <SaveButton variant="outline" onClick={() => setConfirmEmpty(false)} disabled={emptying}>Cancel</SaveButton>
              </>
            )}
          </div>
        ) : null}
      </SettingsCard>

      <SettingsCard title="Export your data" description="Download all your resumes and profile settings as a JSON file.">
        <SaveButton variant="outline" onClick={() => void exportData()} loading={exporting}><Download size={14} /> Download my data</SaveButton>
      </SettingsCard>

      <SettingsCard danger title="Delete account" description="Permanently deletes your account and every resume, including shared links. This cannot be undone.">
        <div className="space-y-4 max-w-md">
          <Field label='Type "DELETE" to confirm' htmlFor="delete-confirm">
            <input id="delete-confirm" value={confirmText} onChange={(event) => setConfirmText(event.target.value)} autoComplete="off" className={inputClass} placeholder="DELETE" />
          </Field>
          <Field label="Your password" htmlFor="delete-password">
            <PasswordInput id="delete-password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </Field>
          {deleteError && (
            <div role="alert" className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <p>{deleteError}</p>
            </div>
          )}
          <SaveButton variant="danger" onClick={() => void deleteAccount()} loading={deleting} disabled={confirmText !== "DELETE" || !password}>Delete my account</SaveButton>
        </div>
      </SettingsCard>
    </div>
  );
}