"use client";

import { useState, type ComponentType } from "react";
import { LayoutTemplate, ShieldAlert, ShieldCheck, Share2, Sparkles, User } from "lucide-react";
import type { UserSettings } from "@/lib/user-settings";
import { ProfileSection } from "./profile-section";
import { SecuritySection } from "./security-section";
import { DefaultsSection } from "./defaults-section";
import { UsageSection } from "./usage-section";
import { SharingSection } from "./sharing-section";
import { DataSection } from "./data-section";

type TabId = "profile" | "security" | "defaults" | "usage" | "sharing" | "data";

const TABS: { id: TabId; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "defaults", label: "Resume defaults", icon: LayoutTemplate },
  { id: "usage", label: "AI usage", icon: Sparkles },
  { id: "sharing", label: "Sharing", icon: Share2 },
  { id: "data", label: "Data & account", icon: ShieldAlert },
];

export function SettingsView({ email, settings }: { email: string; settings: UserSettings }) {
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-foreground/60 mb-8">Manage your profile, security, resume defaults and privacy.</p>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <nav aria-label="Settings sections" className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible -mx-6 px-6 md:mx-0 md:px-0 pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`flex items-center gap-2.5 whitespace-nowrap px-3.5 py-2.5 rounded-lg text-sm text-left transition-colors ${
                tab === id ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted"
              } ${id === "data" ? "md:mt-3" : ""}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {tab === "profile" && <ProfileSection email={email} settings={settings} />}
          {tab === "security" && <SecuritySection email={email} />}
          {tab === "defaults" && <DefaultsSection defaults={settings.resume} />}
          {tab === "usage" && <UsageSection />}
          {tab === "sharing" && <SharingSection />}
          {tab === "data" && <DataSection email={email} />}
        </div>
      </div>
    </div>
  );
}