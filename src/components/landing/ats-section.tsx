"use client";
import { motion } from "framer-motion";
import { ScanEye, CheckCircle2 } from "lucide-react";

const points = [
  "Standard section headings (Experience, Education, Skills) that ATS software recognizes",
  "Clean single-column text flow — no tables or graphics that confuse parsers",
  "Consistent, readable fonts with no embedded images blocking your keywords",
];

export function AtsSection() {
  return (
    <section className="pb-24">
      <div className="grid sm:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full mb-4">
            <ScanEye size={12} /> Built to get past the bots
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Most resumes are read by software first
          </h2>
          <p className="text-foreground/60 mb-6">
            Before a human ever sees your resume, an Applicant Tracking System (ATS) scans
            it for structure and keywords. A beautifully designed resume that an ATS can&apos;t
            parse never reaches a recruiter&apos;s desk.
          </p>
          <ul className="space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/70">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-border bg-muted/30 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Parse check</span>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Passed
            </span>
          </div>
          <div className="space-y-2.5">
            {["Full name detected", "Contact info detected", "Work experience parsed", "Skills section parsed"].map(
              (line) => (
                <div key={line} className="flex items-center gap-2 text-xs text-foreground/60">
                  <CheckCircle2 size={13} className="text-primary" />
                  {line}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}