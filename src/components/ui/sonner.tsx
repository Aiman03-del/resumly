"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// The site is light-only (no ThemeProvider / .dark toggle), so the toaster is
// pinned to "light". Reading the OS theme here made toasts turn dark on a
// light page. If you add a dark-mode toggle later, switch back to useTheme().
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          fontFamily: "inherit",
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0.875rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast border-l-4! shadow-lg!",
          title: "font-medium",
          description: "text-muted-foreground!",
          actionButton: "bg-primary! text-primary-foreground! rounded-lg! font-medium!",
          cancelButton: "bg-muted! text-foreground! rounded-lg!",
          closeButton: "bg-background! border-border!",
          // Brand colours: success = green, error = primary, warning = secondary, info = accent
          success: "border-l-green-600! [&_[data-icon]]:text-green-600",
          error: "border-l-primary! [&_[data-icon]]:text-primary",
          warning: "border-l-secondary! [&_[data-icon]]:text-secondary",
          info: "border-l-accent! [&_[data-icon]]:text-accent",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
