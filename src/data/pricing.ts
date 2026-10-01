// Shared currency formatting for anything priced without a payment
// processor wired up yet (memberships, event registrations).
export function formatPrice(amount: number): string {
  // Defensive against undefined/NaN from older records that predate a
  // pricing field, so a bad value never crashes rendering.
  const value = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  if (value <= 0) return "Free";
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}
