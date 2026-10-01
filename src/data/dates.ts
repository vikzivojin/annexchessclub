// Formats a stored ISO date (YYYY-MM-DD) for display. Appending a local
// midnight time avoids the off-by-one-day bug that `new Date("YYYY-MM-DD")`
// has in timezones behind UTC (it otherwise parses as UTC midnight).
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
