import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in or sign up",
  description: "Log in or create a free Resumly account to start building your resume.",
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}