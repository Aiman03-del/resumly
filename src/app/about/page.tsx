import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Resumly and why we built an AI-assisted resume builder that keeps you in control.",
};

const TECH_STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "Framer Motion",
  "Supabase",
  "ImageKit",
  "OpenAI",
];

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="max-w-2xl mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">About Resumly</h1>
        <p className="text-foreground/60">
          Resumly helps you build a clean, professional resume in minutes. Pick a template, add
          your details, polish the wording, and download or share the result.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border p-6">
          <p className="text-sm font-medium text-primary mb-4">Built by</p>
          <div className="flex items-center gap-4 mb-4">
            <span className="w-14 h-14 rounded-full bg-primary text-primary-fg flex items-center justify-center text-xl font-semibold">
              A
            </span>
            <div>
              <h2 className="text-lg font-semibold">Aiman Siam</h2>
              <p className="text-sm text-foreground/60">Full-Stack Developer</p>
            </div>
          </div>
          <p className="text-sm text-foreground/70 mb-5">
            Resumly was designed and built solo by Aiman, a full-stack developer crafting clean web
            solutions.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://aiman-uddin.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-fg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Portfolio <ExternalLink size={14} />
            </a>
            <a
              href="https://github.com/Aiman03-del"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              GitHub <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-border p-6">
          <p className="text-sm font-medium text-primary mb-4">Built with</p>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <span key={tech} className="px-3 py-1.5 rounded-full bg-muted text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 rounded-xl border border-border p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Ready to build yours?</h2>
        <p className="text-foreground/60 mb-5">It only takes a few minutes.</p>
        <Link
          href="/builder/new"
          className="inline-block px-6 py-2.5 rounded-full bg-primary text-primary-fg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Create your resume
        </Link>
      </div>
    </div>
  );
}
