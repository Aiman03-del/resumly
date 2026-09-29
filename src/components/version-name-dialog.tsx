"use client";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MAX_TITLE_LENGTH, cleanTitle } from "@/lib/resume-version";

function NameForm({
  initialValue,
  confirmLabel,
  onSubmit,
  onCancel,
}: {
  initialValue: string;
  confirmLabel: string;
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const name = cleanTitle(value);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name || busy) return;
    setBusy(true);
    try {
      await onSubmit(name);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Input
        autoFocus
        value={value}
        maxLength={MAX_TITLE_LENGTH}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Version name"
        placeholder="e.g. Frontend Developer CV"
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name || busy}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : confirmLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function VersionNameDialog({
  open,
  onOpenChange,
  title,
  description,
  initialValue,
  confirmLabel,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  initialValue: string;
  confirmLabel: string;
  onSubmit: (name: string) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <NameForm
          key={`${open}-${initialValue}`}
          initialValue={initialValue}
          confirmLabel={confirmLabel}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}