import { describe, expect, it } from "vitest";
import { planSlices } from "./image-pdf";

function canvasWithRows(height: number, blankRows = new Set<number>()): HTMLCanvasElement {
  const context = {
    getImageData: (_x: number, y: number, width: number) => {
      const data = new Uint8ClampedArray(width * 4);
      for (let x = 0; x < width; x++) {
        const offset = x * 4;
        const color = blankRows.has(y) ? 255 : x % 4;
        data[offset] = color;
        data[offset + 1] = blankRows.has(y) ? 255 : 0;
        data[offset + 2] = blankRows.has(y) ? 255 : 0;
        data[offset + 3] = 255;
      }
      return { data } as ImageData;
    },
  } as unknown as CanvasRenderingContext2D;

  return {
    width: 210,
    height,
    getContext: () => context,
  } as unknown as HTMLCanvasElement;
}

describe("planSlices", () => {
  it("keeps a resume that fits on one A4 page as a single slice", () => {
    expect(planSlices(canvasWithRows(200), false)).toEqual([
      { start: 0, end: 200, topMm: 0 },
    ]);
  });

  it("cuts at a blank row and applies margins to following pages", () => {
    expect(planSlices(canvasWithRows(500, new Set([280])), false)).toEqual([
      { start: 0, end: 280, topMm: 0 },
      { start: 280, end: 500, topMm: 12 },
    ]);
  });
});