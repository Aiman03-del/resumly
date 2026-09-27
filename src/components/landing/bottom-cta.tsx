"use client";
import Link from "next/link";

export function BottomCta() {
  return (
    <section className="pb-24">
      <div className="rounded-3xl bg-primary text-primary-fg px-8 py-14 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to build your resume?</h2>
        <p className="opacity-80 max-w-md mx-auto mb-8">
          It&apos;s free, it takes a few minutes, and AI helps you write every section.
        </p>
        <Link
          href="/builder/new"
          className="inline-block px-6 py-3 rounded-full bg-primary-fg text-primary font-medium hover:opacity-90 transition-opacity"
        >
          Start Building — Free
        </Link>
      </div>
    </section>
  );
}