"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/password-input";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";
import { getPasswordStrength } from "@/lib/password-strength";
import { Field, inputClass, SaveButton, SettingsCard } from "./settings-ui";

export function SecuritySection({ email }: { email: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const strong = getPasswordStrength(newPassword).isStrong;
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const canSubmitPassword = Boolean(currentPassword) && strong && newPassword === confirmPassword;

  async function changeEmail() {
    const value = newEmail.trim();
    if (!value || value.toLowerCase() === email.toLowerCase()) return;
    setEmailSaving(true);
    const { error } = await supabase.auth.updateUser(
      { email: value },
      { emailRedirectTo: `${window.location.origin}/auth/callback` },
    );
    setEmailSaving(false);
    if (error) {
      toast.error("Could not change your email", { description: "Check the address and try again." });
      return;
    }
    setNewEmail("");
    toast.success("Check your inbox", { description: "Click the confirmation link to finish changing your email." });
  }

  async function changePassword() {
    setPasswordSaving(true);
    setPasswordError("");
    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setPasswordError(body?.error ?? "We couldn't change your password. Please try again.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed");
    } catch {
      setPasswordError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function signOutEverywhere() {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      setSigningOut(false);
      toast.error("Could not log out of all devices", { description: "Please try again." });
      return;
    }
    window.dispatchEvent(new Event("resumly-auth-changed"));
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Email address" description={`Currently ${email}. We'll send a confirmation link to the new address.`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            aria-label="New email address"
            placeholder="new@example.com"
            className={`${inputClass} mt-0 sm:flex-1`}
          />
          <SaveButton onClick={() => void changeEmail()} loading={emailSaving} disabled={!newEmail.trim() || newEmail.trim().toLowerCase() === email.toLowerCase()}>
            Change email
          </SaveButton>
        </div>
      </SettingsCard>

      <SettingsCard title="Change password" description="Use a strong password you don't use anywhere else.">
        <div className="space-y-4 max-w-md">
          <Field label="Current password" htmlFor="current-password">
            <PasswordInput id="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
          </Field>
          <Field label="New password" htmlFor="new-password">
            <PasswordInput id="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" />
            <PasswordStrengthMeter password={newPassword} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm-password">
            <PasswordInput id="confirm-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
            {mismatch && <p className="text-xs text-red-600 mt-1">Passwords don&apos;t match.</p>}
          </Field>

          {passwordError && (
            <div role="alert" className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <p>{passwordError}</p>
            </div>
          )}
          <SaveButton onClick={() => void changePassword()} loading={passwordSaving} disabled={!canSubmitPassword}>Update password</SaveButton>
        </div>
      </SettingsCard>

      <SettingsCard title="Sessions" description="Lost a device or used a shared computer? Log out everywhere, including this device.">
        <SaveButton variant="outline" onClick={() => void signOutEverywhere()} loading={signingOut}>Log out of all devices</SaveButton>
      </SettingsCard>
    </div>
  );
}