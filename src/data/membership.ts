import type { MembershipStatus } from "../firebase/types";

export type MembershipPlanId = Exclude<MembershipStatus, "none">;
export type MembershipCategory = "casual" | "tournament";
export type MembershipTerm = "annual" | "half-year";

export type MembershipPlan = {
  id: MembershipPlanId;
  label: string;
  category: MembershipCategory;
  term: MembershipTerm;
  months: number;
  price: number;
};

// Prices are placeholders set directly by the club; once Stripe is wired
// up these same figures drive what's actually charged at checkout.
export const membershipPlans: MembershipPlan[] = [
  { id: "casual-annual", label: "Annual Casual Membership", category: "casual", term: "annual", months: 12, price: 200 },
  { id: "casual-half", label: "Half-Year Casual Membership", category: "casual", term: "half-year", months: 6, price: 100 },
  {
    id: "tournament-annual",
    label: "Annual Tournament Membership",
    category: "tournament",
    term: "annual",
    months: 12,
    price: 220,
  },
  {
    id: "tournament-half",
    label: "Half-Year Tournament Membership",
    category: "tournament",
    term: "half-year",
    months: 6,
    price: 110,
  },
];

// Age-based discount: under 16 or 60-and-over gets 20% off any plan.
export const MEMBERSHIP_DISCOUNT_RATE = 0.2;
export const DISCOUNT_UNDER_AGE = 16;
export const DISCOUNT_OVER_AGE = 60;

export function getPlanById(id: MembershipStatus): MembershipPlan | undefined {
  return membershipPlans.find((plan) => plan.id === id);
}

export function formatMembershipLabel(status: MembershipStatus): string {
  if (status === "none") return "Non-member";
  return getPlanById(status)?.label ?? status;
}

export function calculateAge(dateOfBirth: string, atDate: Date = new Date()): number {
  const dob = new Date(dateOfBirth);
  let age = atDate.getFullYear() - dob.getFullYear();
  const monthDiff = atDate.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && atDate.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export function isDiscountEligible(dateOfBirth: string, atDate: Date = new Date()): boolean {
  const age = calculateAge(dateOfBirth, atDate);
  return age < DISCOUNT_UNDER_AGE || age >= DISCOUNT_OVER_AGE;
}

export function getPlanPrice(plan: MembershipPlan, dateOfBirth?: string): number {
  if (dateOfBirth && isDiscountEligible(dateOfBirth)) {
    return Math.round(plan.price * (1 - MEMBERSHIP_DISCOUNT_RATE) * 100) / 100;
  }
  return plan.price;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// Suggests an expiry date for a plan starting today, for the admin portal
// to prefill (and the admin can still override it).
export function suggestExpiryDate(planId: MembershipPlanId, from: Date = new Date()): Date {
  const plan = getPlanById(planId);
  return addMonths(from, plan?.months ?? 12);
}
