import { z } from "zod";
import type { SectionKey } from "@/lib/section-order";

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Enter a valid phone number"),
  role: z.string().optional(),
  location: z.string().optional(),
  photoUrl: z.string().optional(),
});

export const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string(),
});

export const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
});

export const languageSchema = z.object({
  name: z.string().min(1),
  proficiency: z.string().min(1),
});

export const achievementSchema = z.object({
  title: z.string().min(1),
  organization: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

export const awardSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

export const publicationSchema = z.object({
  title: z.string().min(1),
  publisher: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
});

export const courseSchema = z.object({
  name: z.string().min(1),
  provider: z.string().optional(),
  date: z.string().optional(),
  credentialUrl: z.string().optional(),
  description: z.string().optional(),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Experience = z.infer<typeof experienceSchema>;

export interface ResumeData {
  templateId?: string;
  accentColor?: string;
  fontFamily?: string;
  fontScale?: number;
  sectionOrder?: SectionKey[];
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    role?: string;
    location?: string;
    photoUrl?: string;
    fontFamily?: string;
    pageTarget?: "auto" | "1" | "2";
    fontScale?: number;
    /** Hide email and phone on the public share page. */
    hideContact?: boolean;
  };
  summary: string;
  themeColor?: string;
  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    startDate: string;
    endDate?: string;
  }[];
  skills: string[];
  projects: {
    name: string;
    description: string;
    link?: string;
    links?: string[];
  }[];
  certifications: {
    name: string;
    issuer: string;
    issueDate?: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }[];
  languages: {
    name: string;
    proficiency: string;
  }[];
  achievements: {
    title: string;
    organization?: string;
    date?: string;
    description?: string;
  }[];
  awards: {
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
  }[];
  publications: {
    title: string;
    publisher?: string;
    date?: string;
    url?: string;
    description?: string;
  }[];
  courses: {
    name: string;
    provider?: string;
    date?: string;
    credentialUrl?: string;
    description?: string;
  }[];
}

export const LIMITS = {
  url: 2048,
  summary: 2000,
  maxExperience: 20,
  maxEducation: 20,
  maxSkills: 100,
  maxProjects: 20,
  maxCertifications: 50,
  maxLanguages: 30,
  maxAchievements: 30,
  maxAwards: 30,
  maxPublications: 30,
  maxCourses: 50,
} as const;

export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim() || value.length > LIMITS.url) return false;
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function isAllowedPhotoUrl(value: unknown): value is string {
  if (!isHttpUrl(value)) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && url.hostname === "ik.imagekit.io";
  } catch {
    return false;
  }
}

const limitedText = (limit: number) => z.string().max(limit).optional();
const optionalUrl = z.string().max(LIMITS.url).refine(isHttpUrl, "Enter a valid HTTP or HTTPS URL").optional();

const apiPersonalInfoSchema = z.object({
  fullName: limitedText(200),
  email: z.string().email().max(254).optional(),
  phone: limitedText(80),
  role: limitedText(200),
  location: limitedText(200),
  photoUrl: z.string().max(LIMITS.url).refine(isAllowedPhotoUrl, "Photo must be hosted on ImageKit").optional(),
  fontFamily: limitedText(100),
});

export const resumeApiSchema = z.object({
  personalInfo: apiPersonalInfoSchema.default({}),
  summary: z.string().max(LIMITS.summary).default(""),
  experience: z.array(z.object({
    company: limitedText(200),
    role: limitedText(200),
    startDate: limitedText(100),
    endDate: limitedText(100),
    description: limitedText(3000),
  })).max(LIMITS.maxExperience).default([]),
  education: z.array(z.object({
    institution: limitedText(200),
    degree: limitedText(200),
    startDate: limitedText(100),
    endDate: limitedText(100),
  })).max(LIMITS.maxEducation).default([]),
  skills: z.array(z.string().max(200)).max(LIMITS.maxSkills).default([]),
  projects: z.array(z.object({
    name: limitedText(200),
    description: limitedText(3000),
    link: optionalUrl,
    links: z.array(optionalUrl).max(10).optional(),
  })).max(LIMITS.maxProjects).default([]),
  certifications: z.array(z.object({
    name: limitedText(200),
    issuer: limitedText(200),
    issueDate: limitedText(100),
    expiryDate: limitedText(100),
    credentialId: limitedText(200),
    credentialUrl: optionalUrl,
  })).max(LIMITS.maxCertifications).default([]),
  languages: z.array(z.object({ name: limitedText(100), proficiency: limitedText(100) })).max(LIMITS.maxLanguages).default([]),
  achievements: z.array(z.object({
    title: limitedText(200),
    organization: limitedText(200),
    date: limitedText(100),
    description: limitedText(2000),
  })).max(LIMITS.maxAchievements).default([]),
  awards: z.array(z.object({
    title: limitedText(200),
    issuer: limitedText(200),
    date: limitedText(100),
    description: limitedText(2000),
  })).max(LIMITS.maxAwards).default([]),
  publications: z.array(z.object({
    title: limitedText(200),
    publisher: limitedText(200),
    date: limitedText(100),
    url: optionalUrl,
    description: limitedText(2000),
  })).max(LIMITS.maxPublications).default([]),
  courses: z.array(z.object({
    name: limitedText(200),
    provider: limitedText(200),
    date: limitedText(100),
    credentialUrl: optionalUrl,
    description: limitedText(2000),
  })).max(LIMITS.maxCourses).default([]),
});

function sanitizeUrl(value?: string | null) {
  if (!isHttpUrl(value)) return undefined;
  return value.trim();
}

export function sanitizeResumeUrls<T extends ResumeData | null | undefined>(resume: T): T {
  if (!resume) return resume;

  return {
    ...resume,
    personalInfo: {
      ...resume.personalInfo,
      photoUrl: isAllowedPhotoUrl(resume.personalInfo.photoUrl)
        ? resume.personalInfo.photoUrl.trim()
        : undefined,
    },
    projects: resume.projects?.map((project) => ({
      ...project,
      link: sanitizeUrl(project.link),
      links: project.links
        ?.map((link) => sanitizeUrl(link))
        .filter((link): link is string => Boolean(link)),
    })) ?? [],
    certifications:
      resume.certifications?.map((certification) => ({
        ...certification,
        credentialUrl: sanitizeUrl(certification.credentialUrl),
      })) ?? [],
    publications:
      resume.publications?.map((publication) => ({
        ...publication,
        url: sanitizeUrl(publication.url),
      })) ?? [],
    courses:
      resume.courses?.map((course) => ({
        ...course,
        credentialUrl: sanitizeUrl(course.credentialUrl),
      })) ?? [],
  } as T;
}