"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ResumeRenderer } from "@/components/templates";
import { sampleResumeData } from "@/lib/sample-resume";
import type { ResumeData } from "@/types/resume";

const BASE_WIDTH = 800;

export function TemplateThumbnail({
  id,
  accentColor,
  data = sampleResumeData,
  skeleton,
  className = "",
}: {
  id: string;
  accentColor?: string;
  data?: ResumeData;
  skeleton?: ReactNode;
  className?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const update = () => {
      if (outer.clientWidth > 0) setScale(outer.clientWidth / BASE_WIDTH);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);

  const ready = scale > 0;
  const style: CSSProperties = {
    width: BASE_WIDTH,
    transform: `scale(${scale || 1})`,
    transformOrigin: "top left",
  };

  return (
    <div
      aria-hidden="true"
      ref={outerRef}
      className={`relative w-full aspect-3/4 overflow-hidden bg-white ${className}`}
    >
      {!ready && (skeleton ?? <div className="absolute inset-0 animate-pulse bg-neutral-100" />)}
      <div
        inert
        className={`absolute top-0 left-0 pointer-events-none select-none transition-opacity duration-200 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        style={style}
      >
        <ResumeRenderer templateId={id} data={data} accentColor={accentColor} />
      </div>
    </div>
  );
}