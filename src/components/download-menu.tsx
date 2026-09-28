"use client";

import { useState } from "react";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

type Format = "pdf" | "png" | "jpg";

// Same render scale for PNG, JPG and PDF so all three come out the same size.
const EXPORT_SCALE = 2;

export function DownloadMenu({
  targetRef,
  fileName,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
  fileName: string;
}) {
  const [loading, setLoading] = useState<Format | null>(null);

  async function handleExport(format: Format) {
    if (!targetRef.current) return;
    setLoading(format);

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const element = targetRef.current;
      const canvas = await html2canvas(element, {
        scale: EXPORT_SCALE,
        backgroundColor: "#ffffff",
        useCORS: true,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        // The export copy sits off-screen; lay it out normally inside the clone.
        onclone: (_clonedDocument, clonedElement) => {
          const wrapper = clonedElement.parentElement;
          if (wrapper) {
            wrapper.style.position = "static";
            wrapper.style.left = "0";
          }
        },
      });

      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const imgData = canvas.toDataURL("image/png");

        // PDF page = exactly the same size as the PNG/JPG (no margins,
        // no A4 slicing), so it looks identical on mobile and desktop.
        const pageWidth = canvas.width / EXPORT_SCALE;
        const pageHeight = canvas.height / EXPORT_SCALE;

        const pdf = new jsPDF({
          unit: "px",
          format: [pageWidth, pageHeight],
          orientation: pageWidth > pageHeight ? "landscape" : "portrait",
          compress: true,
          hotfixes: ["px_scaling"],
        });

        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");

        pdf.save(`${fileName}.pdf`);
      } else {
        const mime = format === "png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mime, 0.95);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${fileName}.${format}`;
        link.click();
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Could not export the file", { description: "Please try again." });
    } finally {
      setLoading(null);
    }
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  disabled={!!loading}
                  className="p-2.5 rounded-lg bg-primary text-primary-fg hover:opacity-90 transition-opacity disabled:opacity-60"
                  aria-label="Download"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                </button>
              }
            />
          }
        />
        <TooltipContent side="bottom">Download</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText size={14} className="mr-2" /> PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("png")}>
          <FileImage size={14} className="mr-2" /> PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("jpg")}>
          <FileImage size={14} className="mr-2" /> JPG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
