/**
 * Vector PDF export (selectable text, ATS-friendly, real A4 pages).
 * Renders a clone of the resume inside a hidden iframe and uses the
 * browser's print engine ("Save as PDF").
 */

export interface PrintPdfOptions {
  /** Used as the suggested PDF file name. */
  fileName: string;
  /**
   * true  -> page margin 0 (templates with coloured header/sidebar: bold, creative, sidebar-pro)
   * false -> 12mm top/bottom on every page; left/right come from the template's own padding
   */
  fullBleed?: boolean;
}

const A4_WIDTH_PX = 794; // 210mm @ 96dpi

function buildPrintCss(fullBleed: boolean) {
  const margin = fullBleed ? "0" : "12mm 0";
  return `
    @page { size: A4 portrait; margin: ${margin}; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      color: #111 !important;
      color-scheme: light;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-shadow: none !important;
    }
    #resume-print-root { width: 100%; }
    #resume-print-root > div { max-width: 100% !important; }

    /* Page-break handling: never cut an entry (job, degree, project...) in half */
    #resume-print-root section > div,
    #resume-print-root section li,
    #resume-print-root section p,
    #resume-print-root header,
    #resume-print-root h1,
    #resume-print-root h2,
    #resume-print-root h3 {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    /* Never leave a section title alone at the bottom of a page */
    #resume-print-root h1,
    #resume-print-root h2,
    #resume-print-root h3 {
      break-after: avoid;
      page-break-after: avoid;
    }
    #resume-print-root p { orphans: 3; widows: 3; }

    /* Sidebar templates: min-h-[1000px] would force an extra blank page */
    #resume-print-root [class*="min-h-"] { min-height: 0 !important; }

    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; }
  `;
}

function copyStyles(from: Document, to: Document) {
  from
    .querySelectorAll<HTMLElement>('link[rel="stylesheet"], style')
    .forEach((node) => to.head.appendChild(node.cloneNode(true)));
}

function waitForStyles(doc: Document) {
  const links = Array.from(
    doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  );
  return Promise.all(
    links.map(
      (link) =>
        new Promise<void>((resolve) => {
          if (link.sheet) return resolve();
          link.addEventListener("load", () => resolve(), { once: true });
          link.addEventListener("error", () => resolve(), { once: true });
        })
    )
  );
}

function waitForImages(doc: Document) {
  return Promise.all(
    Array.from(doc.images).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
    )
  );
}

export async function printResumeAsPdf(
  element: HTMLElement,
  { fileName, fullBleed = false }: PrintPdfOptions
): Promise<void> {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = `position:fixed;left:-10000px;top:0;width:${A4_WIDTH_PX}px;height:1123px;border:0;visibility:hidden;`;
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc) {
    iframe.remove();
    throw new Error("Print frame is not available");
  }

  doc.open();
  doc.write(
    `<!doctype html><html lang="${document.documentElement.lang || "en"}"><head><meta charset="utf-8"><title></title></head><body></body></html>`
  );
  doc.close();

  copyStyles(document, doc);
  const printStyle = doc.createElement("style");
  printStyle.textContent = buildPrintCss(fullBleed);
  doc.head.appendChild(printStyle);

  const root = doc.createElement("div");
  root.id = "resume-print-root";
  root.appendChild(element.cloneNode(true));
  doc.body.appendChild(root);

  await waitForStyles(doc);
  await waitForImages(doc);
  if (doc.fonts?.ready) await doc.fonts.ready;

  const previousTitle = document.title;
  document.title = fileName;

  await new Promise<void>((resolve) => {
    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      document.title = previousTitle;
      iframe.remove();
      resolve();
    };
    win.addEventListener("afterprint", cleanup, { once: true });
    // Safety net: some browsers never fire afterprint for iframes.
    setTimeout(cleanup, 60_000);

    win.focus();
    // The short delay gives layout time to settle before the dialog opens.
    setTimeout(() => {
      try {
        win.print();
      } catch {
        cleanup();
      }
    }, 150);
  });
}