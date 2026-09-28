export const RESUME_FONTS = [
  {
    value: "Arial",
    label: "Arial",
    css: "Arial, Helvetica, sans-serif",
  },
  {
    value: "Helvetica",
    label: "Helvetica",
    css: "Helvetica, Arial, sans-serif",
  },
  {
    value: "Georgia",
    label: "Georgia",
    css: "Georgia, serif",
  },
  {
    value: "Times New Roman",
    label: "Times New Roman",
    css: '"Times New Roman", Times, serif',
  },
  {
    value: "Verdana",
    label: "Verdana",
    css: "Verdana, Geneva, sans-serif",
  },
  {
    value: "Trebuchet MS",
    label: "Trebuchet MS",
    css: '"Trebuchet MS", Arial, sans-serif',
  },
  {
    value: "Tahoma",
    label: "Tahoma",
    css: "Tahoma, Arial, sans-serif",
  },
  {
    value: "Courier New",
    label: "Courier New",
    css: '"Courier New", Courier, monospace',
  },
] as const;

export type ResumeFontFamily = (typeof RESUME_FONTS)[number]["value"];

export const DEFAULT_RESUME_FONT = "Arial";

export function getResumeFontCss(fontFamily?: string) {
  return (
    RESUME_FONTS.find((font) => font.value === fontFamily)?.css ??
    RESUME_FONTS.find((font) => font.value === DEFAULT_RESUME_FONT)!.css
  );
}