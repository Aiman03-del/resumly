import Link from "next/link";
import { FileX } from "lucide-react";

export default function SharedResumeNotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-6">
      <FileX size={32} className="text-foreground/30 mb-4" />
      <h1 className="text-xl font-semibold mb-2">This resume link isn&apos;t available</h1>
      <p className="text-sm text-foreground/60 max-w-sm mb-6">
        The link may be mistyped, or the owner has turned sharing off.
      </p>
      <Link href="/" className="px-5 py-2 rounded-full bg-primary text-primary-fg text-sm font-medium hover:opacity-90 transition-opacity">
        Go to Resumly
      </Link>
    </div>
  );
}
