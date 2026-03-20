/**
 * Format a date as a human-readable Dutch locale string.
 * @param {Date|string} date
 * @param {boolean} jaar - include the year in the output
 * @returns {string} e.g. "20 mrt" or "20 mrt 2026"
 */
export function niceDate(date, jaar = false) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    ...(jaar && { year: "numeric" }),
  });
}

/**
 * Strip the time portion from a Date, returning midnight of the same day.
 * Returns null for invalid dates.
 */
export function stripTime(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.error("Invalid date:", date);
    return null;
  }
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Return a Dutch semester label, e.g. "1e semester" or "2e semester 2026".
 * Semester 1 = Jan–Jun, Semester 2 = Jul–Dec.
 */
export function getSemester(date, jaar) {
  const d = new Date(date);
  const month = d.getMonth() + 1; // Months are zero-indexed
  let result = month <= 6 ? '1e semester' : '2e semester';
  if (jaar) {

    result += ` ${d.getFullYear()}`;
  }
  return result;
}
