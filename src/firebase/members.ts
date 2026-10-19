import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "./config";
import type { Gender, MemberProfile, MemberRole, MembershipStatus } from "./types";

const membersCollection = collection(db, "members");

export type RegisterMemberInput = {
  displayName: string;
  email: string;
  password: string;
  gender: Gender;
  dateOfBirth: string;
  cfcId?: string;
  fideId?: string;
};

export async function registerMember(input: RegisterMemberInput) {
  const { displayName, email, password, gender, dateOfBirth, cfcId, fideId } = input;
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const profile: MemberProfile = {
    uid: credential.user.uid,
    displayName,
    email,
    role: "member",
    createdAt: Date.now(),
    gender,
    dateOfBirth,
    // Firestore rejects `undefined` field values, so optional IDs are only
    // included when the person actually provided one.
    ...(cfcId ? { cfcId } : {}),
    ...(fideId ? { fideId } : {}),
    membershipType: "none",
    membershipExpiresAt: null,
    autoRenew: false,
    emailOptOutGeneral: false,
    emailOptOutTournamentReminders: false,
    emailOptOutRenewalReminders: false,
  };

  await setDoc(doc(membersCollection, credential.user.uid), profile);
  return profile;
}

export async function loginMember(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export function logoutMember() {
  return firebaseSignOut(auth);
}

export async function fetchMemberProfile(uid: string): Promise<MemberProfile | null> {
  const snapshot = await getDoc(doc(membersCollection, uid));
  return snapshot.exists() ? (snapshot.data() as MemberProfile) : null;
}

export async function fetchAllMembers(): Promise<MemberProfile[]> {
  const snapshot = await getDocs(query(membersCollection, orderBy("createdAt", "desc")));
  return snapshot.docs.map((docSnapshot) => docSnapshot.data() as MemberProfile);
}

export function updateMemberRole(uid: string, role: MemberRole) {
  return updateDoc(doc(membersCollection, uid), { role });
}

// Admin-only: change what membership a member has and when it expires.
// Passing membershipType "none" should be paired with membershipExpiresAt
// null (handled by the caller in the admin portal).
export function updateMembership(uid: string, membershipType: MembershipStatus, membershipExpiresAt: number | null) {
  return updateDoc(doc(membersCollection, uid), { membershipType, membershipExpiresAt });
}

// Self-service: a member can flip their own auto-renewal preference.
// Firestore rules only allow this field to change via a self-update.
export function setAutoRenew(uid: string, autoRenew: boolean) {
  return updateDoc(doc(membersCollection, uid), { autoRenew });
}

// Self-service: a member can opt in/out of each email category
// independently. Firestore rules only allow these fields (plus autoRenew)
// to change via a self-update.
export function setEmailPreferences(
  uid: string,
  preferences: Partial<
    Pick<MemberProfile, "emailOptOutGeneral" | "emailOptOutTournamentReminders" | "emailOptOutRenewalReminders">
  >,
) {
  return updateDoc(doc(membersCollection, uid), preferences);
}
