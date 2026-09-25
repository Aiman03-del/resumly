export interface ResumeTemplate {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}

export const templates: ResumeTemplate[] = [
  { id: "modern", name: "Modern", thumbnail: "/templates/modern.png", description: "Clean, minimal, ATS-friendly" },
  { id: "creative", name: "Creative", thumbnail: "/templates/creative.png", description: "Bold accents, great for design roles" },
  { id: "classic", name: "Classic", thumbnail: "/templates/classic.png", description: "Traditional layout, corporate friendly" },
];