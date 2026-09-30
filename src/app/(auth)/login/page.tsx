"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { GENERIC_LOGIN_ERROR } from "@/lib/auth-errors";
import { safeRedirect } from "@/lib/safe-redirect";
import { SplashLoader } from "@/components/splash-screen";
import { PasswordInput } from "@/components/password-input";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmationError = searchParams.get("error");
  const redirectTo = safeRedirect(searchParams.get("redirectTo"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (confirmationError === "confirmation_failed") {
      toast.error("Email confirmation failed", {
        description: "The link may have expired. Please sign up again.",
      });
    }
  }, [confirmationError]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? GENERIC_LOGIN_ERROR);
        setLoading(false);
        return;
      }
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
      setLoading(false);
      return;
    }

    window.dispatchEvent(new Event("resumly-auth-changed"));
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-foreground/60 text-sm mb-6">Log in to continue building your resume.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              placeholder="Your password"
            />
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-fg font-medium disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-sm text-foreground/60 mt-5 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<SplashLoader />}>
      <LoginForm />
    </Suspense>
  );
}