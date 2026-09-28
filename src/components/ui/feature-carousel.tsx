"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CarouselSlide {
  id: string;
  label: string;
  content: React.ReactNode;
  caption?: React.ReactNode;
}

interface HeroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  subtitle: string;
  slides: CarouselSlide[];
  autoplayMs?: number;
}

export const HeroSection = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ title, subtitle, slides, autoplayMs = 4000, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [paused, setPaused] = React.useState(false);

    const handleNext = React.useCallback(() => {
      setCurrentIndex((previous) => (previous + 1) % slides.length);
    }, [slides.length]);

    const handlePrev = () => {
      setCurrentIndex((previous) => (previous - 1 + slides.length) % slides.length);
    };

    React.useEffect(() => {
      if (!autoplayMs || paused || slides.length < 2) return;
      const timer = setInterval(handleNext, autoplayMs);
      return () => clearInterval(timer);
    }, [handleNext, autoplayMs, paused, slides.length]);

    if (!slides.length) return null;
    const current = slides[currentIndex];

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full flex flex-col items-center justify-center overflow-x-hidden bg-background text-foreground px-4 py-16 md:py-20",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="z-10 flex w-full flex-col items-center text-center space-y-8 md:space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter max-w-4xl">{title}</h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">{subtitle}</p>
          </div>

          <div
            className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative w-full h-full flex items-center justify-center [perspective:1000px]">
              {slides.map((slide, index) => {
                const offset = index - currentIndex;
                const total = slides.length;
                let position = (offset + total) % total;
                if (position > Math.floor(total / 2)) position -= total;

                const isCenter = position === 0;
                const isAdjacent = Math.abs(position) === 1;

                return (
                  <div
                    key={slide.id}
                    aria-hidden={!isCenter}
                    className="absolute w-[240px] h-[340px] md:w-[320px] md:h-[452px] transition-all duration-500 ease-in-out flex items-center justify-center"
                    style={{
                      transform: `translateX(${position * 60}%) scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7}) rotateY(${position * -10}deg)`,
                      zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                      opacity: isCenter ? 1 : isAdjacent ? 0.4 : 0,
                      filter: isCenter ? "blur(0px)" : "blur(4px)",
                      visibility: Math.abs(position) > 1 ? "hidden" : "visible",
                      pointerEvents: isCenter ? "auto" : "none",
                    }}
                  >
                    <div className="w-full h-full overflow-hidden rounded-2xl border-2 border-foreground/10 bg-white shadow-2xl">
                      {slide.content}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button variant="outline" size="icon" aria-label="Previous" className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-20 bg-background/50 backdrop-blur-sm" onClick={handlePrev}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Next" className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-20 bg-background/50 backdrop-blur-sm" onClick={handleNext}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col items-center gap-4" aria-live="polite">
            {current.caption ?? <p className="font-medium">{current.label}</p>}
            <div className="flex items-center gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show ${slide.label}`}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

HeroSection.displayName = "HeroSection";
