import { z } from "zod";

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

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Experience = z.infer<typeof experienceSchema>;

export interface ResumeData {
  templateId?: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    role?: string;
    location?: string;
    photoUrl?: string;
  };
  summary: string;
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
  }[];
}