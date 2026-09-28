"use client";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const STORAGE_KEY = "resumly-splash-seen";
const SPLASH_MS = 2900;

const box = { transformBox: "fill-box" as const };

function AnimatedLogo() {
  const maskId = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="143 115 214 270"
      className="w-32 sm:w-40 h-auto overflow-visible"
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

export function SplashScreen() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {}

    // Play once per browser session, and never for people who prefer reduced motion.
    const skip = seen || !!reduceMotion;
    if (!skip) document.body.style.overflow = "hidden";

    const timer = setTimeout(
      () => {
        if (!skip) {
          try {
            sessionStorage.setItem(STORAGE_KEY, "1");
          } catch {}
        }
        setVisible(false);
      },
      skip ? 0 : SPLASH_MS
    );

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
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
          aria-hidden="true"
          className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-5 bg-background"
          exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.5, ease: "easeInOut" } }}
        >
          <AnimatedLogo />
          <motion.span
            className="text-2xl font-bold tracking-tight text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.0, ease: "easeOut" }}
          >
            Resumly
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}