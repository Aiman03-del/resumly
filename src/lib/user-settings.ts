import { templates } from "@/types/template";
import { DEFAULT_RESUME_FONT, RESUME_FONTS } from "@/lib/font";
import { isHexColor } from "@/lib/theme";
import { normalizeFontScale, normalizePageTarget, type PageTarget } from "@/lib/page-settings";
import { isAllowedPhotoUrl } from "@/types/resume";

/** Preferences stored in Supabase user_metadata. Nested objects are replaced as a whole on update. */
export interface ContactDefaults {
  role: string;
  phone: string;
  location: string;
}

export interface ResumeDefaults {
  templateId: string;
  fontFamily: string;
  themeColor: string | null;
  pageTarget: PageTarget;
  fontScale: number;
}

export interface UserSettings {
  fullName: string;
  avatarUrl: string;
  contact: ContactDefaults;
  resume: ResumeDefaults;
}

export const DEFAULT_RESUME_DEFAULTS: ResumeDefaults = {
  templateId: "modern",
  fontFamily: DEFAULT_RESUME_FONT,
  themeColor: null,
  pageTarget: "auto",
  fontScale: 1,
};

const MAX_TEXT = 120;

function text(value: unknown, max = MAX_TEXT): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function parseUserSettings(metadata: unknown): UserSettings {
  const meta = record(metadata);
  const contact = record(meta.contact_defaults);
  const resume = record(meta.resume_defaults);

  const templateId = templates.some((template) => template.id === resume.templateId)
    ? (resume.templateId as string)
    : DEFAULT_RESUME_DEFAULTS.templateId;
  const fontFamily = RESUME_FONTS.some((font) => font.value === resume.fontFamily)
    ? (resume.fontFamily as string)
    : DEFAULT_RESUME_DEFAULTS.fontFamily;

  return {
    fullName: text(meta.full_name, 100),
    avatarUrl: isAllowedPhotoUrl(meta.avatar_url) ? meta.avatar_url : "",
    contact: {
      role: text(contact.role),
      phone: text(contact.phone, 40),
      location: text(contact.location),
    },
    resume: {
      templateId,
      fontFamily,
      themeColor: isHexColor(resume.themeColor) ? resume.themeColor : null,
      pageTarget: normalizePageTarget(resume.pageTarget),
      fontScale: normalizeFontScale(resume.fontScale),
    },
  };
}

/** Shape sent to supabase.auth.updateUser({ data }). */
export function settingsToMetadata(settings: UserSettings) {
  return {
    full_name: settings.fullName,
    avatar_url: settings.avatarUrl,
    contact_defaults: settings.contact,
    resume_defaults: settings.resume,
  };
}

/** Values used to pre-fill a brand-new resume. Empty values are left out. */
export function resumeSeedFromSettings(settings: UserSettings, accountEmail: string) {
  const { contact, resume } = settings;
  return {
    personalInfo: {
      ...(settings.fullName && { fullName: settings.fullName }),
      ...(accountEmail && { email: accountEmail }),
      ...(contact.phone && { phone: contact.phone }),
      ...(contact.role && { role: contact.role }),
      ...(contact.location && { location: contact.location }),
      fontFamily: resume.fontFamily,
      pageTarget: resume.pageTarget,
      fontScale: resume.fontScale,
    },
    templateId: resume.templateId,
    themeColor: resume.themeColor,
  };
}