"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Link2Off, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { newShareId } from "@/lib/share-id";
import { versionLabel } from "@/lib/resume-version";
import { Switch, SaveButton, SettingsCard } from "./settings-ui";

interface SharedResume {
  id: string;
  title: string | null;
  share_id: string | null;
  deleted_at: string | null;
  personal_info: (Record<string, unknown> & { fullName?: string; hideContact?: boolean }) | null;
}

export function SharingSection() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<SharedResume[] | null>(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("resumes")
      .select("id,title,share_id,deleted_at,personal_info")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (cancelled) return;
        if (loadError) {
          setError(true);
          return;
        }
        setItems(((data ?? []) as SharedResume[]).filter((item) => item.share_id));
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, reloadKey]);

  const linkFor = (item: SharedResume) => `${window.location.origin}/r/${item.share_id}`;

  async function run(action: () => PromiseLike<{ error: unknown }>, done: string) {
    const { error: actionError } = await action();
    setBusyId(null);
    if (actionError) {
      toast.error("Something went wrong", { description: "Please try again." });
      return false;
    }
    toast.success(done);
    setReloadKey((key) => key + 1);
    return true;
  }

  const stopSharing = (item: SharedResume) => {
    setBusyId(item.id);
    return run(() => supabase.from("resumes").update({ is_public: false, share_id: null }).eq("id", item.id), "Sharing turned off");
  };

  const newLink = (item: SharedResume) => {
    setBusyId(item.id);
    return run(() => supabase.from("resumes").update({ share_id: newShareId() }).eq("id", item.id), "New link created. The old link no longer works.");
  };

  const setHideContact = (item: SharedResume, hide: boolean) => {
    setBusyId(item.id);
    return run(
      () => supabase.from("resumes").update({ personal_info: { ...(item.personal_info ?? {}), hideContact: hide } }).eq("id", item.id),
      hide ? "Email and phone are hidden on the public page" : "Email and phone are visible on the public page",
    );
  };

  async function copy(item: SharedResume) {
    try {
      await navigator.clipboard.writeText(linkFor(item));
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Could not copy automatically");
    }
  }

  return (
    <SettingsCard
      title="Shared resumes"
      description="Every resume with a public link. Anyone with the link can view it; search engines are asked not to list it."
    >
      {items === null && !error && (
        <p className="flex items-center gap-2 text-sm text-foreground/60"><Loader2 size={15} className="animate-spin" /> Loading…</p>
      )}
      {error && <p className="text-sm text-red-600">Could not load your shared resumes. Please refresh the page.</p>}
      {items && items.length === 0 && (
        <p className="text-sm text-foreground/60">You haven&apos;t shared any resume yet. Open a resume and use the Share button to create a link.</p>
      )}

      <ul className="space-y-4">
        {items?.map((item) => {
          const busy = busyId === item.id;
          return (
            <li key={item.id} className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-sm truncate">{versionLabel(item.title ?? "", item.personal_info?.fullName ?? "")}</p>
                {item.deleted_at && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">In trash — link still public</span>
                )}
              </div>

              <div className="flex gap-2">
                <input readOnly value={linkFor(item)} onFocus={(event) => event.currentTarget.select()} aria-label="Public link" className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-muted/30 text-xs" />
                <SaveButton variant="outline" onClick={() => void copy(item)} aria-label="Copy link">
                  {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                </SaveButton>
                <a href={linkFor(item)} target="_blank" rel="noopener noreferrer" aria-label="Open public page" className="inline-flex items-center px-3 rounded-lg border border-border hover:bg-muted transition-colors">
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Hide email &amp; phone</p>
                  <p className="text-xs text-foreground/60">Recruiters see the rest of your resume, but not your contact details.</p>
                </div>
                <Switch checked={item.personal_info?.hideContact === true} onChange={(value) => void setHideContact(item, value)} label="Hide email and phone on the public page" disabled={busy} />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <SaveButton variant="outline" onClick={() => void newLink(item)} disabled={busy}><RefreshCw size={14} /> New link</SaveButton>
                <SaveButton variant="outline" onClick={() => void stopSharing(item)} disabled={busy}><Link2Off size={14} /> Stop sharing</SaveButton>
              </div>
            </li>
          );
        })}
      </ul>
    </SettingsCard>
  );
}