import { describe, expect, it } from "vitest";
import { DEFAULT_RESUME_DEFAULTS, parseUserSettings, resumeSeedFromSettings } from "./user-settings";

describe("parseUserSettings", () => {
  it("returns safe defaults for missing or malformed metadata", () => {
    for (const input of [undefined, null, "x", 42, [], {}]) {
      const settings = parseUserSettings(input);
      expect(settings.fullName).toBe("");
      expect(settings.avatarUrl).toBe("");
      expect(settings.resume).toEqual(DEFAULT_RESUME_DEFAULTS);
    }
  });

  it("keeps valid values and drops invalid ones", () => {
    const settings = parseUserSettings({
      full_name: "  Rahim Uddin  ",
      avatar_url: "https://evil.example.com/a.png",
      contact_defaults: { role: "Engineer", phone: "123456", location: 5 },
      resume_defaults: { templateId: "nope", fontFamily: "Georgia", themeColor: "#2563eb", pageTarget: "2", fontScale: 9 },
    });
    expect(settings.fullName).toBe("Rahim Uddin");
    expect(settings.avatarUrl).toBe("");
    expect(settings.contact).toEqual({ role: "Engineer", phone: "123456", location: "" });
    expect(settings.resume).toEqual({ templateId: "modern", fontFamily: "Georgia", themeColor: "#2563eb", pageTarget: "2", fontScale: 1.2 });
  });

  it("accepts an ImageKit avatar", () => {
    expect(parseUserSettings({ avatar_url: "https://ik.imagekit.io/abc/me.png" }).avatarUrl).toBe("https://ik.imagekit.io/abc/me.png");
  });
});

describe("resumeSeedFromSettings", () => {
  it("only pre-fills values that were set", () => {
    const seed = resumeSeedFromSettings(parseUserSettings({ full_name: "Rahim", contact_defaults: { phone: "0123456" } }), "me@example.com");
    expect(seed.personalInfo).toMatchObject({ fullName: "Rahim", email: "me@example.com", phone: "0123456", fontFamily: DEFAULT_RESUME_DEFAULTS.fontFamily });
    expect(seed.personalInfo).not.toHaveProperty("role");
    expect(seed.personalInfo).not.toHaveProperty("location");
    expect(seed.templateId).toBe("modern");
  });
});