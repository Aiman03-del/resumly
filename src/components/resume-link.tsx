import type { ReactNode } from "react";
import { toHref } from "@/lib/link-utils";

export function ResumeLink({
  url,
  children,
  className,
}: {
  url: string;
  children: ReactNode;
  className?: string;
}) {
  const href = toHref(url);
  if (!href) return <span className={className}>{children}</span>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}