"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/password-input";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";
import { getPasswordStrength, MIN_PASSWORD_LENGTH } from "@/lib/password-strength";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);
  const passwordIsStrong = getPasswordStrength(password).isStrong;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordIsStrong) {
      setError("Please choose a stronger password that meets all the requirements below.");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (signupError) {
      if (signupError.message.includes("User already registered")) {
        setError("An account with this email already exists. Try logging in instead.");
      } else if (signupError.message.includes("Password should be")) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      } else {
        setError(signupError.message);
      }
      setLoading(false);
      return;
    }

    if (data.session) {
      toast.success("Account created");
      router.push("/dashboard");
      router.refresh();
    } else {
      setCheckEmail(true);
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
          <p className="text-foreground/60 text-sm">
            We sent a confirmation link to <span className="font-medium">{email}</span>. Click it to activate your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-foreground/60 text-sm mb-6">Start building a resume that gets you hired.</p>

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
              autoComplete="new-password"
              placeholder="Create a strong password"
            />
            <PasswordStrengthMeter password={password} />
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !passwordIsStrong}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-fg font-medium disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-foreground/60 mt-5 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}