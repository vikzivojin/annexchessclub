// Shared shapes for the Firestore collections used across auth, the
// member area, and the admin portal.

export type MemberRole = "member" | "admin";

export type Gender = "female" | "male" | "non-binary" | "prefer-not-to-say";

// "none" means a registered account that hasn't paid for a membership yet.
export type MembershipStatus = "none" | "casual-annual" | "tournament-annual" | "tournament-half";

export type MemberProfile = {
  uid: string;
  displayName: string;
  email: string;
  role: MemberRole;
  createdAt: number; // epoch millis, set with Date.now() on sign up
  gender: Gender;
  dateOfBirth: string; // ISO date, e.g. "1990-05-14"
  cfcId?: string;
  fideId?: string;
  membershipType: MembershipStatus;
  membershipExpiresAt: number | null; // epoch millis, null when there's no active membership
  autoRenew: boolean;
  // Each defaults to false (opted in) at sign up. A member can opt out of
  // any combination of these from their account page.
  emailOptOutGeneral: boolean;
  emailOptOutTournamentReminders: boolean;
  emailOptOutRenewalReminders: boolean;
};

export type EventType = "tournament" | "class" | "meeting";

export type ScheduleRound = {
  label: string; // e.g. "Round 1"
  date: string; // ISO date, e.g. "2026-09-14" — must be one of the tournament's days
};

export type ScheduleItem = {
  id: string;
  title: string;
  time: string;
  description: string;
  order: number;
  memberPrice: number; // 0 means free
  nonMemberPrice: number; // 0 means free
  archived: boolean; // archived items are kept for the record but hidden from the public site
  eventType: EventType;
  // Tournament only (otherwise ""/[]): a tournament can span consecutive
  // days, run weekly, or be a single day, so its days are an explicit list
  // of dates rather than a date range.
  sections: string;
  tournamentDays: string[]; // ISO dates
  rounds: ScheduleRound[];
  // Class only (otherwise []): each session's date.
  classDates: string[]; // ISO dates
  // Meeting only (otherwise ""): always a single date.
  meetingDate: string; // ISO date
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
};

// A member or non-member registering interest in a schedule item/event.
// There's no payment processing yet (that comes with Stripe), so this is
// just a record the club can follow up on.
export type EventRegistration = {
  id: string;
  scheduleItemId: string;
  uid: string;
  price: number;
  isMember: boolean;
  createdAt: number;
  section?: string; // tournament only — the section they're playing in
  byeRounds?: string[]; // tournament only — round labels the registrant is sitting out
};

// Which opt-out a bulk email is checked against: general club emails,
// tournament reminders, or membership renewal reminders.
export type EmailCategory = "general" | "tournament-reminder" | "renewal-reminder";

// A record of a bulk email the admin sent, kept for history. The actual
// delivery happens via the Firebase "Trigger Email" extension, which
// watches the `mail` collection for documents this creates.
export type EmailCampaign = {
  id: string;
  subject: string;
  body: string;
  category: EmailCategory;
  recipientCount: number;
  sentAt: number;
  sentBy: string; // display name of the admin who sent it
};
