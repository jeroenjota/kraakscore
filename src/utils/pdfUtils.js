import { niceDate } from "./dateUtils";

export function getPdfFileName(datum) {
  const nDate = niceDate(datum, true);
  return `kraken_${nDate}`
    .replace(/\s+/g, '_')
    .toLowerCase()
    + '.pdf';
}

export function getPdfUrl(datum) {
  const publicBase = import.meta.env.VITE_PUBLIC_URL || '';
  const uploadsBase = import.meta.env.VITE_UPLOADS_URL || '';
  const filename = getPdfFileName(datum);

  // Combineer public URL + uploads path + pdf
  return `${publicBase}${uploadsBase}/pdfs/${encodeURIComponent(filename)}`;
}

