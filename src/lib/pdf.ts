interface PdfLine {
  text: string;
  font: "regular" | "bold";
  size: number;
  gapAfter: number;
}

interface PdfSection {
  heading: string;
  lines: string[];
}

interface PdfDocumentOptions {
  fileName: string;
  title: string;
  subtitle?: string;
  sections: PdfSection[];
}

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_MARGIN_X = 46;
const PAGE_MARGIN_TOP = 786;
const PAGE_MARGIN_BOTTOM = 54;

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function toAscii(value: string) {
  return value
    .replace(/°/g, " deg")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/–|—/g, "-")
    .replace(/•/g, "-")
    .replace(/μ/g, "u")
    .replace(/·/g, "-")
    .replace(/[^\x20-\x7E]/g, "");
}

function wrapText(value: string, maxChars: number) {
  const normalized = toAscii(value).replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [""];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    if (word.length <= maxChars) {
      current = word;
      continue;
    }

    let remaining = word;
    while (remaining.length > maxChars) {
      lines.push(`${remaining.slice(0, maxChars - 1)}-`);
      remaining = remaining.slice(maxChars - 1);
    }
    current = remaining;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function buildDocumentLines({ title, subtitle, sections }: PdfDocumentOptions) {
  const lines: PdfLine[] = [
    { text: title, font: "bold", size: 20, gapAfter: 18 }
  ];

  if (subtitle) {
    for (const line of wrapText(subtitle, 86)) {
      lines.push({ text: line, font: "regular", size: 11, gapAfter: 14 });
    }
  }

  for (const section of sections) {
    lines.push({ text: section.heading, font: "bold", size: 13, gapAfter: 12 });
    if (section.lines.length === 0) {
      lines.push({ text: "No items available.", font: "regular", size: 10, gapAfter: 10 });
      continue;
    }

    for (const entry of section.lines) {
      const wrapped = wrapText(entry, 92);
      wrapped.forEach((line, index) => {
        lines.push({
          text: index === 0 ? `- ${line}` : `  ${line}`,
          font: "regular",
          size: 10,
          gapAfter: index === wrapped.length - 1 ? 8 : 0
        });
      });
    }

    lines.push({ text: "", font: "regular", size: 10, gapAfter: 6 });
  }

  return lines;
}

function paginateLines(lines: PdfLine[]) {
  const pages: PdfLine[][] = [];
  let currentPage: PdfLine[] = [];
  let y = PAGE_MARGIN_TOP;

  for (const line of lines) {
    const lineHeight = line.size + line.gapAfter;
    if (y - lineHeight < PAGE_MARGIN_BOTTOM && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      y = PAGE_MARGIN_TOP;
    }

    currentPage.push(line);
    y -= lineHeight;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

function buildPageContent(lines: PdfLine[]) {
  let y = PAGE_MARGIN_TOP;
  const chunks = ["BT"];

  for (const line of lines) {
    const fontId = line.font === "bold" ? "F2" : "F1";
    chunks.push(`/${fontId} ${line.size} Tf`);
    chunks.push(`1 0 0 1 ${PAGE_MARGIN_X} ${y} Tm`);
    chunks.push(`(${escapePdfText(line.text)}) Tj`);
    y -= line.size + line.gapAfter;
  }

  chunks.push("ET");
  return chunks.join("\n");
}

function buildPdf(pages: string[]) {
  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  let nextObjectId = 5;

  for (const content of pages) {
    const pageObjectId = nextObjectId;
    const contentObjectId = nextObjectId + 1;
    pageObjectIds.push(pageObjectId);

    objects[pageObjectId] =
      `${pageObjectId} 0 obj\n` +
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectId} 0 R >>\n` +
      `endobj\n`;

    objects[contentObjectId] =
      `${contentObjectId} 0 obj\n` +
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`;

    nextObjectId += 2;
  }

  objects[1] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  objects[2] = `2 0 obj\n<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] >>\nendobj\n`;
  objects[3] = "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  objects[4] = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n";

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (let index = 1; index < objects.length; index += 1) {
    const object = objects[index];
    if (!object) {
      continue;
    }

    offsets[index] = pdf.length;
    pdf += object;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < objects.length; index += 1) {
    const offset = offsets[index] ?? 0;
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

export function downloadPdfDocument(options: PdfDocumentOptions) {
  const documentLines = buildDocumentLines(options);
  const pages = paginateLines(documentLines).map(buildPageContent);
  const pdfContent = buildPdf(pages);
  const blob = new Blob([pdfContent], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = options.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
