"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

const BASE_WIDTH = 800;

export function ScaledPreview({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const observer = new ResizeObserver(() => {
      setScale(Math.min(1, outer.clientWidth / BASE_WIDTH));
      setInnerHeight(inner.offsetHeight);
    });
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="w-full overflow-hidden" style={{ height: innerHeight * scale }}>
      <div
        ref={innerRef}
        style={{ width: BASE_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}
