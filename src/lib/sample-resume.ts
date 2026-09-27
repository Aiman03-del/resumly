import { ResumeData } from "@/types/resume";

export const sampleResumeData: ResumeData = {
  personalInfo: {
    fullName: "MR X",
    email: "ayesha.rahman@email.com",
    phone: "+880 1XX-XXXXXXX",
    location: "Dhaka, Bangladesh",
    photoUrl: "https://sb.kaleidousercontent.com/67418/1000x1000/8fbbfc9296/cv-color-thumbnail.png",
  },
  summary:
    "Product-minded frontend engineer with 4 years of experience building fast, accessible web apps used by thousands of daily users.",
  experience: [
    {
      company: "Nexbridge Tech",
      role: "Frontend Engineer",
      startDate: "2022",
      endDate: "Present",
      description:
        "Led the redesign of the core dashboard, improving load time by 45% and cutting support tickets by a third.",
    },
    {
      company: "Studio Loop",
      role: "Junior Developer",
      startDate: "2020",
      endDate: "2022",
      description: "Built and shipped 12+ client landing pages with a small design-engineering team.",
    },
  ],
  education: [
    {
      institution: "University of Dhaka",
      degree: "B.Sc. in Computer Science",
      startDate: "2016",
      endDate: "2020",
    },
  ],
  skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Figma"],
  projects: [
    {
      name: "Resumly",
      description: "An AI-assisted resume builder with 10 templates and instant PDF export.",
    },
  ],
};