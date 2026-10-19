import { initializeApp } from "firebase-admin/app";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import nodemailer from "nodemailer";

initializeApp();

// Set once via the Firebase CLI (never hardcoded, never committed):
//   firebase functions:secrets:set MAILJET_API_KEY
//   firebase functions:secrets:set MAILJET_SECRET_KEY
//   firebase functions:secrets:set MAIL_FROM_ADDRESS
// Mailjet's "API key" and "secret key" are used here as the SMTP
// username/password; MAIL_FROM_ADDRESS is the verified sender address set
// up in Mailjet (e.g. "Annex Chess Club <noreply@annexchessclub.com>").
const mailjetApiKey = defineSecret("MAILJET_API_KEY");
const mailjetSecretKey = defineSecret("MAILJET_SECRET_KEY");
const mailFromAddress = defineSecret("MAIL_FROM_ADDRESS");

type MailDocument = {
  to?: unknown;
  message?: {
    subject?: unknown;
    text?: unknown;
    html?: unknown;
  };
};

// Watches the `mail` collection that the admin portal's Email panel (and
// any future transactional emails, e.g. registration/event confirmations)
// write to, and sends each one through Mailjet's SMTP relay. This does the
// same job as Firebase's official "Trigger Email" extension, which this
// replaces because that extension's whole platform is being discontinued
// by Google (Firebase Extensions shuts down March 31, 2027).
export const sendMailDocument = onDocumentCreated(
  {
    document: "mail/{mailId}",
    secrets: [mailjetApiKey, mailjetSecretKey, mailFromAddress],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data() as MailDocument;
    const recipients = Array.isArray(data.to) ? data.to.filter((address): address is string => typeof address === "string") : [];
    const subject = typeof data.message?.subject === "string" ? data.message.subject : undefined;
    const text = typeof data.message?.text === "string" ? data.message.text : undefined;
    const html = typeof data.message?.html === "string" ? data.message.html : undefined;

    if (recipients.length === 0 || !subject) {
      await snapshot.ref.update({
        delivery: { state: "ERROR", error: "Missing recipients or subject", attemptedAt: Date.now() },
      });
      return;
    }

    const transport = nodemailer.createTransport({
      host: "in-v3.mailjet.com",
      port: 465,
      secure: true,
      auth: {
        user: mailjetApiKey.value(),
        pass: mailjetSecretKey.value(),
      },
    });

    try {
      await transport.sendMail({
        from: mailFromAddress.value(),
        to: recipients,
        subject,
        text,
        html,
      });
      await snapshot.ref.update({ delivery: { state: "SUCCESS", sentAt: Date.now() } });
    } catch (error) {
      await snapshot.ref.update({
        delivery: {
          state: "ERROR",
          error: error instanceof Error ? error.message : String(error),
          attemptedAt: Date.now(),
        },
      });
    }
  },
);
