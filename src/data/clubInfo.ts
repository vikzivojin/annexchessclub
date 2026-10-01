// Central place for club facts so copy stays consistent across pages.
// Update here once Firebase is wired in for anything that becomes dynamic
// (event dates, member counts, etc.).

export const clubInfo = {
  name: "Annex Chess Club",
  motto: "Chess for everyone",
  address: {
    line1: "918 Bathurst Street",
    line2: "Toronto, ON M5R 3G5",
    mapQuery: "918 Bathurst Street, Toronto, ON M5R 3G5",
  },
  phone: "416-306-2065",
  email: "info@annexchessclub.com",
  openDay: "Monday",
  hours: {
    skittles: "6:30 PM",
    tournament: "7:30 PM",
  },
};

export type ScheduleItem = {
  title: string;
  time: string;
  description: string;
  memberPrice: number;
  nonMemberPrice: number;
};

// Fallback copy shown before an admin has entered anything through the
// portal (see useScheduleItems). Prices here are placeholders; set the
// real ones in the admin Schedule tab.
export const weeklySchedule: ScheduleItem[] = [
  {
    title: "Casual play & skittles room",
    time: "6:30 PM",
    description:
      "Doors open for informal games, analysis, and getting a board set up before the tournament round begins.",
    memberPrice: 0,
    nonMemberPrice: 0,
  },
  {
    title: "Weekly tournament",
    time: "7:30 PM",
    description:
      "Five rounds across Crown, U1800, and U1400 sections. Time control is 90 minutes plus a 30 second increment.",
    memberPrice: 0,
    nonMemberPrice: 0,
  },
  {
    title: "Women's Chess Club",
    time: "Second Monday of the month",
    description:
      "A dedicated evening for women players of all levels to meet, play, and support one another's progress.",
    memberPrice: 0,
    nonMemberPrice: 0,
  },
];

export const onlineSchedule: ScheduleItem[] = [
  {
    title: "Advanced online instruction",
    time: "Tuesday & Thursday evenings",
    description:
      "Structured lessons for stronger players looking to sharpen openings, calculation, and endgame technique.",
    memberPrice: 0,
    nonMemberPrice: 0,
  },
];

export type Division = {
  name: string;
  description: string;
};

export const divisions: Division[] = [
  {
    name: "Crown",
    description: "Our top section for experienced tournament players.",
  },
  {
    name: "U1800",
    description: "For improving players building toward expert strength.",
  },
  {
    name: "U1400",
    description: "A welcoming section for newer tournament players.",
  },
];

export type MembershipBenefit = {
  title: string;
  description: string;
};

export const membershipBenefits: MembershipBenefit[] = [
  {
    title: "Full access to the chess library",
    description:
      "Borrow opening manuals, endgame references, and classic game collections built up by the club over the years.",
  },
  {
    title: "Discounted classes and tournaments",
    description:
      "Members pay less to enter weekly tournaments, major events, and any classes the club runs through the year.",
  },
  {
    title: "VIP access to special events",
    description:
      "Priority spots at the Toronto Open, the Toronto Closed Championship, and other club-hosted events.",
  },
];

export const classOfferings = [
  {
    title: "Beginner classes",
    description: "In-person lessons covering the rules, basic tactics, and how to think through a game.",
  },
  {
    title: "Intermediate classes",
    description: "In-person instruction for players ready to study openings, tactics, and simple endgames in depth.",
  },
  {
    title: "Advanced online instruction",
    description: "Tuesday and Thursday evening sessions for stronger players working on tournament preparation.",
  },
];
