import Image from "next/image";

/**
 * Brand mark from /public/Resumly.png.
 * The PNG has a lot of transparent padding around the mark, so it is drawn oversized
 * inside a clipped square — that way the visible logo fills the box you give it.
 */
export function Logo({ size = 36, priority = false }: { size?: number; priority?: boolean }) {
  return (
    <span className="relative block shrink-0 overflow-hidden" style={{ width: size, height: size }}>
      <Image
        src="/Resumly.png"
        alt="Resumly"
        width={500}
        height={500}
        sizes={`${Math.round(size * 1.7)}px`}
        priority={priority}
        className="absolute left-1/2 top-1/2 h-[170%] w-[170%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
      />
    </span>
  );
}