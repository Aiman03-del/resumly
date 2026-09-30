import "./globals.css";
import type { Metadata } from "next";
import { SplashScreen } from "@/components/splash-screen";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - AI Resume Builder`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: { icon: "/Resumly.png", apple: "/Resumly.png" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - AI Resume Builder`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/Resumly.png", width: 500, height: 500, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} - AI Resume Builder`,
    description: SITE_DESCRIPTION,
    images: ["/Resumly.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SplashScreen />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}