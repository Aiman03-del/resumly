import Link from "next/link";
import { FileText } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { href: "/templates", label: "Templates" },
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Get started",
    links: [
      { href: "/login", label: "Sign In" },
      { href: "/signup", label: "Sign Up" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="no-print border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-fg">
                <FileText size={16} />
              </span>
              Resumly
            </Link>
            <p className="mt-3 text-sm text-foreground/60 max-w-xs">
              Build a clean, professional resume in minutes.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border text-sm text-foreground/50">
          © {new Date().getFullYear()} Resumly. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
