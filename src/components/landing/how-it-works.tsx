"use client";
import { motion } from "framer-motion";
import { FileText, Wand2, Download } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Fill in your details",
    desc: "Add your experience, education, skills, and projects through a simple guided form.",
  },
  {
    icon: Wand2,
    title: "Polish with AI",
    desc: "Let AI tighten your summary, experience, and project descriptions section by section.",
  },
  {
    icon: Download,
    title: "Pick a template & export",
    desc: "Choose from 10 ATS-friendly templates and download a polished PDF in one click.",
  },
];

export function HowItWorks() {
  return (
    <section className="pb-24">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">How it works</h2>
        <p className="text-foreground/60 max-w-md mx-auto">
          Three simple steps between you and a resume you&apos;re proud to send.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12, duration: 0.4 }}
            className="text-center sm:text-left"
          >
            <div className="w-11 h-11 rounded-full bg-primary text-primary-fg flex items-center justify-center mb-4 mx-auto sm:mx-0 font-semibold">
              {index + 1}
            </div>
            <h3 className="font-semibold mb-1.5 flex items-center gap-2 justify-center sm:justify-start">
              <step.icon size={16} className="text-primary" /> {step.title}
            </h3>
            <p className="text-sm text-foreground/60">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}