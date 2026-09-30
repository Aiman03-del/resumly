import type { ResumeData } from "@/types/resume";

export const sampleResumeData: ResumeData = {
  personalInfo: {
    fullName: "MR X",
    email: "x.rahman@email.com",
    phone: "+880 1XX-XXXXXXX",
    role: "Frontend Engineer",
    location: "Dhaka, Bangladesh",
    photoUrl: "https://sb.kaleidousercontent.com/67418/1000x1000/8fbbfc9296/cv-color-thumbnail.png",
  },
  summary:
    "Product-minded frontend engineer with 4+ years of experience building fast, accessible web apps used by thousands of people every day. Comfortable owning features end to end, from design handoff and API integration to performance tuning and release. Enjoys mentoring teammates and turning messy requirements into simple interfaces.",
  experience: [
    {
      company: "Nexbridge Tech",
      role: "Frontend Engineer",
      startDate: "2022",
      endDate: "Present",
      description:
        "Led the redesign of the core dashboard, improving load time by 45% and cutting support tickets by a third. Introduced a shared component library adopted by 4 product teams and mentored 3 junior developers.",
    },
    {
      company: "Studio Loop",
      role: "Junior Developer",
      startDate: "2020",
      endDate: "2022",
      description:
        "Built and shipped 12+ client landing pages with a small design-engineering team. Raised average Lighthouse performance scores from 62 to 94 through image optimization and code splitting.",
    },
    {
      company: "Pixel Works",
      role: "Web Development Intern",
      startDate: "2019",
      endDate: "2020",
      description:
        "Converted Figma designs into responsive, cross-browser layouts and fixed 60+ UI bugs across three production websites.",
    },
  ],
  education: [
    {
      institution: "University of Dhaka",
      degree: "B.Sc. in Computer Science",
      startDate: "2016",
      endDate: "2020",
    },
    {
      institution: "Dhaka College",
      degree: "Higher Secondary Certificate (Science)",
      startDate: "2014",
      endDate: "2016",
    },
  ],
  skills: [
    "React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js",
    "GraphQL", "Figma", "Jest", "Accessibility", "Git",
  ],
  projects: [
    {
      name: "Resumly",
      description: "An AI-assisted resume builder with 10 templates, ATS checks and instant PDF export.",
    },
    {
      name: "TaskFlow",
      description: "A real-time kanban board with drag-and-drop, offline support and team comments.",
    },
  ],
  certifications: [
    { name: "Meta Front-End Developer Certificate", issuer: "Coursera", issueDate: "2023" },
    { name: "Google UX Design Certificate", issuer: "Google", issueDate: "2022" },
  ],
  languages: [
    { name: "Bangla", proficiency: "Native" },
    { name: "English", proficiency: "Fluent" },
    { name: "Hindi", proficiency: "Conversational" },
  ],
  achievements: [
    {
      title: "Employee of the Year",
      organization: "Nexbridge Tech",
      date: "2024",
      description: "Recognized for leading the dashboard redesign and mentoring the junior team.",
    },
  ],
  awards: [
    {
      title: "National Hackathon — 1st Place",
      issuer: "ICT Division",
      date: "2021",
      description: "Built a working prototype for a telemedicine app in 36 hours.",
    },
  ],
  publications: [
    {
      title: "Building Accessible Design Systems",
      publisher: "Dev Community",
      date: "2023",
      description: "A practical guide to shipping accessible React components at scale.",
    },
  ],
  courses: [
    { name: "Advanced React Patterns", provider: "Frontend Masters", date: "2023" },
    { name: "Web Performance Fundamentals", provider: "Udemy", date: "2022" },
  ],
};