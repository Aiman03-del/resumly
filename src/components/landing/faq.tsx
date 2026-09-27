"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is Resumly really free?",
    a: "Yes — building, editing, and downloading your resume as a PDF is completely free.",
  },
  {
    q: "Are the templates ATS-friendly?",
    a: "All templates use clean, single-column-friendly structures designed to parse correctly in applicant tracking systems.",
  },
  {
    q: "How does the AI polishing work?",
    a: 'Each section (summary, experience, projects) has a "Polish with AI" button that rewrites your draft into clearer, more impactful language — you stay in control and can edit the result.',
  },
  {
    q: "Can I switch templates after filling in my details?",
    a: "Yes — your content and template are separate, so you can preview your resume in any template without retyping anything.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((value) => !value)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-sm sm:text-base">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-foreground/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-foreground/60">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <section className="pb-24">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Frequently asked questions</h2>
      </div>
      <div className="max-w-2xl mx-auto space-y-3">
        {faqs.map((faq) => (
          <FaqItem key={faq.q} q={faq.q} a={faq.a} />
        ))}
      </div>
    </section>
  );
}