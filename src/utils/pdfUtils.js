/**
 * pdfUtils – PDF filename and URL helpers.
 * Constructs standardised file names and public URLs for tournament PDFs.
 */
import { niceDate } from "./dateUtils";

/** Build a filename like "kraken_20_mrt_2026.pdf" from a tournament date. */
export function getPdfFileName(datum) {
  const nDate = niceDate(datum, true);
  return `kraken_${nDate}`
    .replace(/\s+/g, '_')
    .toLowerCase()
    + '.pdf';
}

/** Build the full public URL to a tournament PDF. */
export function getPdfUrl(datum) {
  const publicBase = import.meta.env.VITE_PUBLIC_URL || '';
  const uploadsBase = import.meta.env.VITE_UPLOADS_URL || '';
  const filename = getPdfFileName(datum);

  // Combineer public URL + uploads path + pdf
  return `${publicBase}${uploadsBase}/pdfs/${encodeURIComponent(filename)}`;
}

