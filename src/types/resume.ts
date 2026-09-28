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
  sectionOrder?: SectionKey[];
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    role?: string;
    location?: string;
    photoUrl?: string;
    fontFamily?: string;
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