"use client";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// The first-load splash stays for at least this long (measured from the start of the
// page load) so the logo animation can finish, and never longer than SPLASH_MAX_MS.
const SPLASH_MIN_MS = 2600;
const SPLASH_MAX_MS = 10000;

const box = { transformBox: "fill-box" as const };

function AnimatedLogo({ className = "w-32 sm:w-40 h-auto overflow-visible" }: { className?: string }) {
  const maskId = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="143 115 214 270"
      className={className}
      role="img"
      aria-label="Resumly logo"
    >
      <defs>
        {/* The "R" is a negative-space cutout: the strokes below are drawn in black
            inside the mask, so the page background shows through the document. */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="143" y="115" width="214" height="270">
          <rect x="143" y="115" width="214" height="270" fill="#fff" />

          {/* stem — grows downward */}
          <motion.rect
            x="178"
            y="183"
            width="44"
            height="152"
            rx="16"
            fill="#000"
            style={{ ...box, transformOrigin: "50% 0%" }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
          />
          {/* bowl — drawn around */}
          <motion.path
            d="M200 198H253A32 32 0 0 1 253 262H200"
            fill="none"
            stroke="#000"
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ pathLength: { duration: 0.45, delay: 1.0, ease: "easeInOut" }, opacity: { duration: 0.01, delay: 1.0 } }}
          />
          {/* leg — kicks out last */}
          <motion.path
            d="M243 270L302 334"
            fill="none"
            stroke="#000"
            strokeWidth="30"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ pathLength: { duration: 0.3, delay: 1.4, ease: "easeOut" }, opacity: { duration: 0.01, delay: 1.4 } }}
          />
        </mask>
      </defs>

      {/* document body */}
      <motion.g
        style={{ ...box, transformOrigin: "50% 50%" }}
        initial={{ scale: 0.55, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 210, damping: 17, delay: 0.1 }}
      >
        <path
          mask={`url(#${maskId})`}
          fill="#EE3D35"
          d="M181 115H265Q273 115 278 120L352 194Q357 199 357 207V347A38 38 0 0 1 319 385H181A38 38 0 0 1 143 347V153A38 38 0 0 1 181 115Z"
        />
      </motion.g>

      {/* folded corner — pops open from the top-right */}
      <motion.path
        d="M296.7 119H353V175.3Z"
        fill="#F59713"
        stroke="#F59713"
        strokeWidth="8"
        strokeLinejoin="round"
        style={{ ...box, transformOrigin: "100% 0%" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 1.6 }}
      />

      {/* accent dot — bounces in */}
      <motion.circle
        cx="204"
        cy="303"
        r="13"
        fill="#8245E8"
        style={{ ...box, transformOrigin: "50% 50%" }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.4, 1] }}
        transition={{ duration: 0.5, delay: 1.85, times: [0, 0.6, 1], ease: "easeOut" }}
      />
    </svg>
  );
}

function Wordmark({ className, delay }: { className: string; delay: number }) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      Resumly
    </motion.span>
  );
}

/**
 * The loading indicator used everywhere in the app (pages, panels, modals).
 * - "page":  fills the area under the navbar (route / page loading)
 * - "panel": compact, for modals and sections
 * - fullscreen: covers the whole viewport
 */
export function SplashLoader({
  size = "page",
  label,
  fullscreen = false,
}: {
  size?: "page" | "panel";
  label?: string;
  fullscreen?: boolean;
}) {
  const panel = size === "panel" && !fullscreen;
  const wrapper = fullscreen
    ? "fixed inset-0 z-100 bg-background"
    : panel
      ? "py-10"
      : "min-h-[calc(100vh-64px)]";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
      className={`${wrapper} flex flex-col items-center justify-center gap-4`}
    >
      <AnimatedLogo className={panel ? "w-16 h-auto overflow-visible" : "w-32 sm:w-40 h-auto overflow-visible"} />
      <Wordmark className={panel ? "text-base font-bold tracking-tight" : "text-2xl font-bold tracking-tight"} delay={2.0} />
      {label && <p className="text-sm text-foreground/60">{label}</p>}
    </div>
  );
}

/**
 * Root splash: shown on EVERY full page load / reload and removed only once the page
 * (document, images, fonts) has finished loading.
 */
export function SplashScreen() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const startTime = performance.now();
    if (document.body) {
      document.body.style.overflow = "hidden";
    }

    const minMs = reduceMotion ? 0 : SPLASH_MIN_MS;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const pageLoaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });
    const fontsReady: Promise<unknown> = document.fonts?.ready ?? Promise.resolve();

    Promise.all([pageLoaded, fontsReady]).then(() => {
      if (cancelled) return;
      const elapsed = performance.now() - startTime;
      // Use the actual page load elapsed time so the splash still respects the
      // minimum-duration guarantee without waiting twice on fast loads.
      timer = setTimeout(() => setVisible(false), Math.max(0, minMs - elapsed));
    });

    // Safety net: never trap the user behind the splash.
    const fallback = setTimeout(() => setVisible(false), SPLASH_MAX_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(fallback);
      if (document.body) {
        document.body.style.overflow = "";
      }
    };
  }, [reduceMotion]);

  // Restore scrolling as soon as the splash starts leaving.
  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          role="status"
          aria-label="Loading Resumly"
          className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-5 bg-background"
          exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.5, ease: "easeInOut" } }}
        >
          <AnimatedLogo />
          <Wordmark className="text-2xl font-bold tracking-tight text-foreground" delay={2.0} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}