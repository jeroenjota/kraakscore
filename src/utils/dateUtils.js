export function niceDate(date, jaar = false) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    ...(jaar && { year: "numeric" }),
  });
}

export function stripTime(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.error("Invalid date:", date);
    return null;
  }
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getSemester(date, jaar) {
  const d = new Date(date);
  const month = d.getMonth() + 1; // Months are zero-indexed
  let result = month <= 6 ? '1e semester' : '2e semester';
  if (jaar) {

    result += ` ${d.getFullYear()}`;
  }
  return result;
}
