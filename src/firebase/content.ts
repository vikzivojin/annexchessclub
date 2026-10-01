import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  addDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";
import type { Announcement, EventRegistration, ScheduleItem } from "./types";

const scheduleCollection = collection(db, "schedule");
const announcementsCollection = collection(db, "announcements");
const eventRegistrationsCollection = collection(db, "eventRegistrations");

// Schedule -----------------------------------------------------------------

// fetchSchedule returns every item, active and archived alike, so the admin
// portal can manage both; fetchActiveSchedule is what the public site uses.

export async function fetchSchedule(): Promise<ScheduleItem[]> {
  const snapshot = await getDocs(query(scheduleCollection, orderBy("order", "asc")));
  return snapshot.docs.map((d) => {
    const data = d.data();
    // Items created before pricing/archiving were added won't have these
    // fields in Firestore yet; default them rather than letting the rest of
    // the app deal with undefined values.
    return {
      id: d.id,
      ...data,
      memberPrice: typeof data.memberPrice === "number" ? data.memberPrice : 0,
      nonMemberPrice: typeof data.nonMemberPrice === "number" ? data.nonMemberPrice : 0,
      archived: typeof data.archived === "boolean" ? data.archived : false,
      eventType:
        data.eventType === "tournament" || data.eventType === "class" || data.eventType === "meeting"
          ? data.eventType
          : "meeting",
      sections: typeof data.sections === "string" ? data.sections : "",
      tournamentDays: Array.isArray(data.tournamentDays) ? data.tournamentDays : [],
      rounds: Array.isArray(data.rounds) ? data.rounds : [],
      classDates: Array.isArray(data.classDates) ? data.classDates : [],
      meetingDate: typeof data.meetingDate === "string" ? data.meetingDate : "",
    } as ScheduleItem;
  });
}

export async function fetchActiveSchedule(): Promise<ScheduleItem[]> {
  const items = await fetchSchedule();
  return items.filter((item) => !item.archived);
}

export function saveScheduleItem(item: ScheduleItem) {
  const { id, ...data } = item;
  return setDoc(doc(scheduleCollection, id), data);
}

export function deleteScheduleItem(id: string) {
  return deleteDoc(doc(scheduleCollection, id));
}

export async function createScheduleItem(item: Omit<ScheduleItem, "id">) {
  const ref = await addDoc(scheduleCollection, item);
  return ref.id;
}

// Archiving keeps the item (and any of its past registrations) around for
// the record, it just stops showing up on the public Schedule page.
export function setScheduleItemArchived(id: string, archived: boolean) {
  return setDoc(doc(scheduleCollection, id), { archived }, { merge: true });
}

// Announcements -----------------------------------------------------------

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const snapshot = await getDocs(query(announcementsCollection, orderBy("createdAt", "desc")));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Announcement);
}

export async function createAnnouncement(title: string, body: string) {
  const ref = await addDoc(announcementsCollection, { title, body, createdAt: Date.now() });
  return ref.id;
}

// Edits an existing announcement's title/body. createdAt (and so its
// position in the list) is left untouched.
export function saveAnnouncement(id: string, title: string, body: string) {
  return setDoc(doc(announcementsCollection, id), { title, body }, { merge: true });
}

export function deleteAnnouncement(id: string) {
  return deleteDoc(doc(announcementsCollection, id));
}

// Event registrations -------------------------------------------------------
// No payment processing yet (that comes with Stripe), so registering just
// records interest for the club to follow up on.

export async function fetchMyRegistration(
  scheduleItemId: string,
  uid: string,
): Promise<EventRegistration | null> {
  const snapshot = await getDocs(
    query(eventRegistrationsCollection, where("scheduleItemId", "==", scheduleItemId), where("uid", "==", uid)),
  );
  if (snapshot.empty) return null;
  const docSnapshot = snapshot.docs[0];
  return { id: docSnapshot.id, ...docSnapshot.data() } as EventRegistration;
}

// Admin-only: every registration for a given schedule item, for the
// Registrants view in the admin portal.
export async function fetchRegistrationsForEvent(scheduleItemId: string): Promise<EventRegistration[]> {
  const snapshot = await getDocs(query(eventRegistrationsCollection, where("scheduleItemId", "==", scheduleItemId)));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as EventRegistration);
}

export async function registerForEvent(input: {
  scheduleItemId: string;
  uid: string;
  price: number;
  isMember: boolean;
  section?: string;
  byeRounds?: string[];
}) {
  const { section, byeRounds, ...rest } = input;
  const data: Record<string, unknown> = { ...rest, createdAt: Date.now() };
  // Firestore rejects `undefined` field values, so these are only included
  // when the registrant actually chose a section/byes (tournaments only).
  if (section) data.section = section;
  if (byeRounds && byeRounds.length > 0) data.byeRounds = byeRounds;
  const ref = await addDoc(eventRegistrationsCollection, data);
  return ref.id;
}
