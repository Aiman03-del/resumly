"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CardData {
  id: string;
  rotation: number;
  render: () => React.ReactNode;
}

function ModernMock() {
  return (
    <div className="w-full h-full bg-white p-3 space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b-2 border-primary/60">
        <div className="w-6 h-6 rounded-full bg-neutral-300" />
        <div className="space-y-1">
          <div className="h-1.5 bg-neutral-700 rounded w-16" />
          <div className="h-1 bg-neutral-300 rounded w-20" />
        </div>
      </div>
      <div className="h-1 bg-primary/50 rounded w-1/4" />
      <div className="h-1 bg-neutral-200 rounded w-full" />
      <div className="h-1 bg-neutral-200 rounded w-5/6" />
      <div className="flex gap-1 flex-wrap pt-1">
        <div className="h-2 bg-primary/20 rounded-full w-8" />
        <div className="h-2 bg-primary/20 rounded-full w-10" />
      </div>
    </div>
  );
}

function CreativeMock() {
  return (
    <div className="w-full h-full bg-white flex">
      <div className="w-[35%] bg-neutral-900 p-2 space-y-1.5">
        <div className="w-5 h-5 rounded-full bg-white/30" />
        <div className="h-1 bg-white/40 rounded w-4/5" />
        <div className="h-1 bg-white/25 rounded w-2/3 mt-2" />
      </div>
      <div className="flex-1 p-2 space-y-1.5">
        <div className="h-1.5 bg-accent/60 rounded w-1/2" />
        <div className="h-1 bg-neutral-300 rounded w-full" />
        <div className="h-1 bg-neutral-300 rounded w-5/6" />
      </div>
    </div>
  );
}

function TimelineMock() {
  return (
    <div className="w-full h-full bg-white p-3">
      <div className="h-1.5 bg-neutral-800 rounded w-2/5 mb-3" />
      <div className="pl-3 border-l-2 border-primary/30 space-y-2">
        <div className="relative">
          <span className="absolute -left-3.75 top-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
          <div className="h-1 bg-neutral-300 rounded w-full" />
        </div>
        <div className="relative">
          <span className="absolute -left-3.75 top-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
          <div className="h-1 bg-neutral-300 rounded w-4/5" />
        </div>
        <div className="relative">
          <span className="absolute -left-3.75 top-0.5 w-1.5 h-1.5 rounded-full bg-neutral-300" />
          <div className="h-1 bg-neutral-200 rounded w-3/5" />
        </div>
      </div>
    </div>
  );
}

function BoldMock() {
  return (
    <div className="w-full h-full bg-white">
      <div className="h-9 bg-primary" />
      <div className="p-3 space-y-1.5">
        <div className="h-1 bg-neutral-300 rounded w-full" />
        <div className="h-1 bg-neutral-300 rounded w-4/5" />
        <div className="flex gap-1 pt-1">
          <div className="h-2 bg-primary/30 rounded-full w-8" />
          <div className="h-2 bg-primary/30 rounded-full w-6" />
        </div>
      </div>
    </div>
  );
}

function SidebarProMock() {
  return (
    <div className="w-full h-full bg-white flex p-2 gap-1.5">
      <div className="w-[32%] bg-neutral-50 border border-neutral-200 rounded-sm p-1.5 space-y-1">
        <div className="w-5 h-5 rounded bg-neutral-300" />
        <div className="h-1 bg-neutral-400 rounded w-4/5" />
        <div className="h-1 bg-neutral-300 rounded w-3/5" />
      </div>
      <div className="flex-1 space-y-1.5 p-1">
        <div className="h-1 bg-neutral-300 rounded w-full" />
        <div className="h-1 bg-neutral-300 rounded w-4/5" />
        <div className="h-1 bg-neutral-300 rounded w-full mt-2" />
      </div>
    </div>
  );
}

const cards: CardData[] = [
  { id: "modern", rotation: -14, render: () => <ModernMock /> },
  { id: "creative", rotation: 8, render: () => <CreativeMock /> },
  { id: "timeline", rotation: -6, render: () => <TimelineMock /> },
  { id: "bold", rotation: 16, render: () => <BoldMock /> },
  { id: "sidebar-pro", rotation: -18, render: () => <SidebarProMock /> },
];

export function HeroTemplateCarousel() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [angles, setAngles] = useState(
    cards.map((_, index) => index * (360 / cards.length) - 90)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setAngles((previous) => previous.map((angle) => (angle + 0.15) % 360));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    });
  }

  return (
    <div
      className="relative w-full h-80 sm:h-96"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0.5, y: 0.5 })}
    >
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1000px" }}>
        {cards.map((card, index) => {
          const angle = angles[index] * (Math.PI / 180);
          const radiusX = 110;
          const radiusY = 90;
          const x = Math.cos(angle) * radiusX;
          const y = Math.sin(angle) * radiusY;

          const perspectiveX = (mousePosition.x - 0.5) * 15;
          const perspectiveY = (mousePosition.y - 0.5) * 15;

          return (
            <div
              key={card.id}
              className="absolute w-24 h-32 sm:w-32 sm:h-44 transition-transform duration-300"
              style={{
                transform: `translate(${x}px, ${y}px) rotateX(${perspectiveY}deg) rotateY(${perspectiveX}deg) rotateZ(${card.rotation}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className={cn(
                  "relative w-full h-full rounded-xl overflow-hidden border border-border shadow-2xl",
                  "transition-transform duration-300 hover:scale-110 hover:z-10 cursor-pointer"
                )}
              >
                {card.render()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
