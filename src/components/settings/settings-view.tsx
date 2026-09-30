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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-foreground/60 mb-6 sm:mb-8">Manage your profile, security, resume defaults and privacy.</p>

      <div className="grid gap-6 md:gap-8 md:grid-cols-[220px_1fr]">
        <nav
          aria-label="Settings sections"
          className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:flex md:flex-col md:gap-1 md:sticky md:top-24 md:self-start"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`flex items-center gap-2.5 min-w-0 px-3 md:px-3.5 py-2.5 rounded-lg border text-sm text-left leading-tight transition-colors ${
                tab === id
                  ? "bg-primary/10 text-primary font-medium border-primary/30 md:border-transparent"
                  : "text-foreground/70 border-border hover:bg-muted md:border-transparent"
              } ${id === "data" ? "md:mt-3" : ""}`}
            >
              <span className="shrink-0">
                <Icon size={16} />
              </span>
              <span className="min-w-0">{label}</span>
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