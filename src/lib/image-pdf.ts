import type { jsPDF } from "jspdf";

const PAGE_W_MM = 210;
const PAGE_H_MM = 297;
const MARGIN_MM = 12;

interface Slice {
  /** First canvas row of this page (inclusive). */
  start: number;
  /** Last canvas row of this page (exclusive). */
  end: number;
  /** Where the slice is placed on the page, in mm. */
  topMm: number;
}

/** A row is blank when it holds at most 3 distinct colours (page + sidebar/edge colours, no text). */
function isBlankRow(ctx: CanvasRenderingContext2D, width: number, y: number) {
  const pixels = new Uint32Array(ctx.getImageData(0, y, width, 1).data.buffer);
  const seen = new Set<number>();
  for (let x = 0; x < width; x++) {
    seen.add(pixels[x]);
    if (seen.size > 3) return false;
  }
  return true;
}

/** Looks upward from `from` for a blank row so a page never cuts through a line of text. */
function findCutRow(ctx: CanvasRenderingContext2D, width: number, from: number, minY: number) {
  for (let y = from; y >= minY; y--) {
    if (isBlankRow(ctx, width, y)) return y;
  }
  return from;
}

function isBlankRegion(ctx: CanvasRenderingContext2D, width: number, start: number, end: number) {
  for (let y = start; y < end; y++) {
    if (!isBlankRow(ctx, width, y)) return false;
  }
  return true;
}

export function planSlices(canvas: HTMLCanvasElement, fullBleed: boolean): Slice[] {
  const pxPerMm = canvas.width / PAGE_W_MM;
  const pageHeightPx = Math.round(PAGE_H_MM * pxPerMm);

  // Fits on one A4 page: keep it exactly as it looks on screen.
  if (canvas.height <= pageHeightPx * 1.02) {
    return [{ start: 0, end: canvas.height, topMm: 0 }];
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return [{ start: 0, end: canvas.height, topMm: 0 }];

  const margin = fullBleed ? 0 : MARGIN_MM;
  const slices: Slice[] = [];
  let y = 0;

  while (y < canvas.height) {
    const topMm = slices.length === 0 ? 0 : margin;
    const usablePx = Math.floor((PAGE_H_MM - topMm - margin) * pxPerMm);
    let end = y + usablePx;

    if (end >= canvas.height) {
      end = canvas.height;
    } else {
      end = findCutRow(ctx, canvas.width, end, y + Math.floor(usablePx * 0.85));
    }

    // Skip a last page that would only contain empty space (e.g. bottom padding).
    if (slices.length > 0 && isBlankRegion(ctx, canvas.width, y, end)) break;

    slices.push({ start: y, end, topMm });
    y = end;
  }

  return slices;
}

/** Turns the rendered resume canvas into a real multi-page A4 PDF (image based). */
export async function canvasToA4Pdf(canvas: HTMLCanvasElement, { fullBleed = false } = {}): Promise<jsPDF> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  const pxPerMm = canvas.width / PAGE_W_MM;

  planSlices(canvas, fullBleed).forEach((slice, index) => {
    const height = slice.end - slice.start;
    const part = document.createElement("canvas");
    part.width = canvas.width;
    part.height = height;

    const partCtx = part.getContext("2d");
    if (!partCtx) throw new Error("Canvas is not available");
    partCtx.fillStyle = "#ffffff";
    partCtx.fillRect(0, 0, part.width, part.height);
    partCtx.drawImage(canvas, 0, slice.start, canvas.width, height, 0, 0, canvas.width, height);

    if (index > 0) pdf.addPage();
    pdf.addImage(part.toDataURL("image/png"), "PNG", 0, slice.topMm, PAGE_W_MM, height / pxPerMm, undefined, "FAST");
  });

  return pdf;
}