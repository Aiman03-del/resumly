"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const router = useRouter();

  return (
    <section className="bg-background text-foreground font-serif min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-6">
        <div className="flex justify-center">
          <div className="w-full sm:w-10/12 md:w-8/12 text-center">
            <div
              className="bg-[url(https://cdn.21st.dev/assets/mirror/35/354f63f88b57aceea4536df0c0cff0c3592aa46fe887ff910751fefc12f3e76c.gif)] h-[250px] sm:h-[350px] md:h-[400px] bg-center bg-no-repeat bg-contain"
              aria-hidden="true"
            >
              <h1 className="text-center text-black text-6xl sm:text-7xl md:text-8xl pt-6 sm:pt-8">
                404
              </h1>
            </div>

            <div className="mt-[-50px]">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Looks like you&apos;re lost</h3>
              <p className="mb-6 text-foreground/70 sm:mb-5">
                The page you are looking for is not available!
              </p>

              <Button variant="default" size="lg" onClick={() => router.push("/")} className="my-5 h-10 px-5 text-sm">
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
