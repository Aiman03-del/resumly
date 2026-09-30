"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "@/components/image-upload";
import type { UserSettings } from "@/lib/user-settings";
import { Field, inputClass, SaveButton, SettingsCard } from "./settings-ui";

export function ProfileSection({ email, settings }: { email: string; settings: UserSettings }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [fullName, setFullName] = useState(settings.fullName);
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl);
  const [role, setRole] = useState(settings.contact.role);
  const [phone, setPhone] = useState(settings.contact.phone);
  const [location, setLocation] = useState(settings.contact.location);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
        contact_defaults: { role: role.trim(), phone: phone.trim(), location: location.trim() },
      },
    });
    setSaving(false);
    if (error) {
      toast.error("Could not save your profile", { description: "Please try again." });
      return;
    }
    toast.success("Profile saved");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Profile" description="Your name and photo for your Resumly account.">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="shrink-0">
            <ImageUpload value={avatarUrl || undefined} onUploaded={setAvatarUrl} onRemoved={() => setAvatarUrl("")} />
          </div>
          <div className="flex-1 space-y-4">
            <Field label="Full name" htmlFor="settings-name">
              <input id="settings-name" value={fullName} maxLength={100} onChange={(event) => setFullName(event.target.value)} className={inputClass} placeholder="Your name" />
            </Field>
            <Field label="Email" htmlFor="settings-email" hint="Change your email in the Security tab.">
              <input id="settings-email" value={email} readOnly disabled className={inputClass} />
            </Field>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Default contact details"
        description="Pre-filled into every new resume so you don't retype them. Your name and account email are used too."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Job title" htmlFor="settings-role">
            <input id="settings-role" value={role} maxLength={120} onChange={(event) => setRole(event.target.value)} className={inputClass} placeholder="Frontend Engineer" />
          </Field>
          <Field label="Phone" htmlFor="settings-phone">
            <input id="settings-phone" value={phone} maxLength={40} onChange={(event) => setPhone(event.target.value)} className={inputClass} placeholder="+880 1XXX-XXXXXX" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Location" htmlFor="settings-location">
              <input id="settings-location" value={location} maxLength={120} onChange={(event) => setLocation(event.target.value)} className={inputClass} placeholder="Dhaka, Bangladesh" />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <SaveButton onClick={() => void save()} loading={saving}>Save profile</SaveButton>
        </div>
      </SettingsCard>
    </div>
  );
}