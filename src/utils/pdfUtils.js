import { niceDate } from "./dateUtils";

export function getPdfFileName(datum) {
  const nDate = niceDate(datum, true);
  return `kraken_${nDate}`
    .replace(/\s+/g, '_')
    .toLowerCase()
    + '.pdf';
}


export function getPdfUrl(datum) {
  const base = import.meta.env.VITE_UPLOADS_URL || '';
  const filename = getPdfFileName(datum);

  return `${base}/pdfs/${encodeURIComponent(filename)}`;
}
