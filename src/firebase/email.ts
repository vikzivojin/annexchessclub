import { addDoc, collection, doc, getDocs, orderBy, query, writeBatch } from "firebase/firestore";
import { db } from "./config";
import { fetchAllMembers } from "./members";
import type { EmailCampaign, EmailCategory, MemberProfile } from "./types";

const mailCollection = collection(db, "mail");
const emailCampaignsCollection = collection(db, "emailCampaigns");

export const EMAIL_CATEGORY_LABELS: Record<EmailCategory, string> = {
  general: "General email",
  "tournament-reminder": "Tournament reminder",
  "renewal-reminder": "Renewal reminder",
};

type OptOutField = "emailOptOutGeneral" | "emailOptOutTournamentReminders" | "emailOptOutRenewalReminders";

// Which opt-out field on a member's profile governs each email category.
function optOutField(category: EmailCategory): OptOutField {
  switch (category) {
    case "tournament-reminder":
      return "emailOptOutTournamentReminders";
    case "renewal-reminder":
      return "emailOptOutRenewalReminders";
    case "general":
    default:
      return "emailOptOutGeneral";
  }
}

export function membersEligibleForCategory(members: MemberProfile[], category: EmailCategory): MemberProfile[] {
  const field = optOutField(category);
  return members.filter((member) => !member[field]);
}

// A simple plain-text-to-HTML wrapper: the admin writes paragraphs
// separated by a blank line, which become <p> tags so the email doesn't
// arrive as one unbroken line of text.
function toHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// Firestore batched writes cap at 500 operations; this leaves headroom so a
// large member list is split across a few batches instead of hitting that.
const BATCH_SIZE = 450;

// Sending just writes one `mail` collection document per eligible
// recipient (each with its own `to`, so no one sees anyone else's email
// address). The Firebase "Trigger Email" extension watches that collection
// and does the actual sending via the SMTP provider configured on it.
export async function sendBulkEmail(input: {
  subject: string;
  body: string;
  category: EmailCategory;
  sentBy: string;
}): Promise<{ recipientCount: number }> {
  const { subject, body, category, sentBy } = input;
  const members = await fetchAllMembers();
  const recipients = membersEligibleForCategory(members, category).filter((member) => !!member.email);
  const html = toHtml(body);

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    for (const member of recipients.slice(i, i + BATCH_SIZE)) {
      batch.set(doc(mailCollection), {
        to: [member.email],
        message: { subject, text: body, html },
      });
    }
    await batch.commit();
  }

  await addDoc(emailCampaignsCollection, {
    subject,
    body,
    category,
    recipientCount: recipients.length,
    sentAt: Date.now(),
    sentBy,
  });

  return { recipientCount: recipients.length };
}

export async function fetchEmailCampaigns(): Promise<EmailCampaign[]> {
  const snapshot = await getDocs(query(emailCampaignsCollection, orderBy("sentAt", "desc")));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as EmailCampaign);
}
