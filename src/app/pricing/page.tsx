import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for Resumly's AI resume builder.",
};

const INCLUDED = [
  "10 resume templates",
  "Custom colors and drag-and-drop section order",
  "AI polish for your resume text",
  "ATS check",
  "Cover letter generation",
  "Profile photo upload",
  "Download as PDF",
  "Share with a public link",
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Pricing</h1>
        <p className="text-foreground/60">Resumly is free to use. Everything below is included.</p>
      </div>

      <div className="max-w-md mx-auto rounded-xl border border-border p-8">
        <p className="text-sm font-medium text-primary mb-2">Free</p>
        <p className="text-4xl font-bold mb-1">$0</p>
        <p className="text-sm text-foreground/60 mb-6">Build as many resumes as you need.</p>

        <ul className="space-y-3 mb-8">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Check size={12} />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/builder/new"
          className="block text-center px-6 py-2.5 rounded-full bg-primary text-primary-fg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Get started
        </Link>
      </div>
    </div>
  );
}
