export interface ResumeTemplate {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}

export const templates: ResumeTemplate[] = [
  { id: "modern", name: "Modern", thumbnail: "", description: "Clean, minimal, ATS-friendly" },
  { id: "creative", name: "Creative", thumbnail: "", description: "Bold accents, great for design roles" },
  { id: "classic", name: "Classic", thumbnail: "", description: "Traditional layout, corporate friendly" },
  { id: "minimal", name: "Minimal", thumbnail: "", description: "Ultra-clean, typography-focused" },
  { id: "timeline", name: "Timeline", thumbnail: "", description: "Vertical timeline, great for career growth stories" },
  { id: "compact", name: "Compact", thumbnail: "", description: "Dense two-column layout, fits more on one page" },
  { id: "bold", name: "Bold Header", thumbnail: "", description: "Colorful header banner, stands out visually" },
  { id: "elegant", name: "Elegant", thumbnail: "", description: "Fully serif, centered, editorial style" },
  { id: "sidebar-pro", name: "Sidebar Pro", thumbnail: "", description: "Light sidebar with photo, professional and structured" },
  { id: "tech", name: "Tech", thumbnail: "", description: "Monospace font, developer/engineer aesthetic" },
];