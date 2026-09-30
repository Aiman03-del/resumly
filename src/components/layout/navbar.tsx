"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, Settings, User as UserIcon, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/templates", label: "Templates" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [supabase] = useState(createClient);
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const refreshUser = () => supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    refreshUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    window.addEventListener("resumly-auth-changed", refreshUser);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("resumly-auth-changed", refreshUser);
    };
  }, [supabase]);

  async function handleLogout() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const displayName =
    (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "") ||
    user?.email?.split("@")[0] ||
    "User";

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const linkClass = (href: string) =>
    `text-sm transition-colors ${isActive(href) ? "text-foreground font-medium" : "text-foreground/60 hover:text-foreground"}`;

  return (
    <header className="no-print sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="Resumly home" className="flex items-center">
            <Logo size={40} priority />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-40 h-8" />
          ) : user ? (
            <>
              <Link href="/builder/new" className="hidden sm:block px-4 py-2 rounded-full bg-primary text-primary-fg text-sm font-medium hover:opacity-90 transition-opacity">
                New Resume
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      aria-label="User menu"
                      className="flex items-center justify-center size-9 rounded-full border border-border bg-muted text-foreground/70 hover:text-foreground hover:bg-accent transition-colors outline-none"
                    >
                      <UserIcon size={18} />
                    </button>
                  }
                />

                <DropdownMenuContent align="end" sideOffset={8} className="w-64">
                  <DropdownMenuItem
                    render={<Link href="/account" />}
                    className="flex-col items-start gap-0 px-2 py-2"
                  >
                    <span className="text-sm font-medium text-foreground truncate max-w-full">{displayName}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-full">{user.email}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem render={<Link href="/dashboard" />} className="px-2 py-2">
                    <LayoutDashboard size={15} /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/settings" />} className="px-2 py-2">
                    <Settings size={15} /> Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem variant="destructive" onClick={handleLogout} className="px-2 py-2">
                    <LogOut size={15} /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="hidden sm:block px-4 py-2 rounded-full bg-primary text-primary-fg text-sm font-medium hover:opacity-90 transition-opacity">
                Sign Up
              </Link>
            </>
          )}

          <button onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu" aria-expanded={menuOpen} className="md:hidden p-1.5 -mr-1.5 text-foreground/70 hover:text-foreground">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="max-w-6xl mx-auto px-6 py-3 flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={`py-2.5 ${linkClass(link.href)}`}>
                {link.label}
              </Link>
            ))}

            <div className="mt-2 pt-3 border-t border-border flex flex-col gap-1">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm text-foreground/70">Dashboard</Link>
                  <Link href="/builder/new" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm text-foreground/70">New Resume</Link>
                  <Link href="/settings" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm text-foreground/70">Settings</Link>
                  <button onClick={handleLogout} className="py-2.5 text-sm text-left text-red-500">Log Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm text-foreground/70">Sign In</Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm text-foreground/70">Sign Up</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
