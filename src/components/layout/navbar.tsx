"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, LayoutDashboard, User } from "lucide-react";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-fg">
            <FileText size={16} />
          </span>
          Resumly
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-foreground/70">
          <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <LayoutDashboard size={15} /> Dashboard
          </Link>
          <Link href="/account" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <User size={15} /> Account
          </Link>
        </nav>

        <Link
          href="/builder/new"
          className="px-4 py-2 rounded-full bg-primary text-primary-fg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          New Resume
        </Link>
      </div>
    </motion.header>
  );
}