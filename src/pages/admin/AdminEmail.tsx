import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { fetchAllMembers } from "../../firebase/members";
import {
  EMAIL_CATEGORY_LABELS,
  fetchEmailCampaigns,
  membersEligibleForCategory,
  sendBulkEmail,
} from "../../firebase/email";
import type { EmailCampaign, EmailCategory, MemberProfile } from "../../firebase/types";

const emptyDraft = {
  subject: "",
  body: "",
  category: "general" as EmailCategory,
};

export function AdminEmail() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<MemberProfile[] | null>(null);
  const [campaigns, setCampaigns] = useState<EmailCampaign[] | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [reviewing, setReviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const loadCampaigns = () => {
    fetchEmailCampaigns()
      .then(setCampaigns)
      .catch(() => setStatus({ type: "error", message: "Couldn't load past emails." }));
  };

  useEffect(() => {
    fetchAllMembers()
      .then(setMembers)
      .catch(() => setStatus({ type: "error", message: "Couldn't load members." }));
    loadCampaigns();
  }, []);

  const recipientCount = useMemo(
    () => (members ? membersEligibleForCategory(members, draft.category).filter((m) => !!m.email).length : 0),
    [members, draft.category],
  );

  const startReview = () => {
    if (!draft.subject.trim() || !draft.body.trim()) {
      setStatus({ type: "error", message: "Please write a subject and a message before sending." });
      return;
    }
    setStatus(null);
    setReviewing(true);
  };

  const handleSend = async () => {
    setSending(true);
    setStatus(null);
    try {
      const { recipientCount: sentTo } = await sendBulkEmail({
        subject: draft.subject.trim(),
        body: draft.body.trim(),
        category: draft.category,
        sentBy: profile?.displayName ?? "Admin",
      });
      setStatus({
        type: "success",
        message: sentTo > 0 ? `Sent to ${sentTo} recipient${sentTo === 1 ? "" : "s"}.` : "No one was eligible to receive this email.",
      });
      setDraft(emptyDraft);
      setReviewing(false);
      loadCampaigns();
    } catch {
      setStatus({ type: "error", message: "Couldn't send that email. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-panel">
      <h1>Email</h1>
      <p className="admin-panel__lede">
        Send an email to every registered account that hasn't opted out of the category you pick below. Members
        manage their own opt-outs from their account page.
      </p>

      {!reviewing ? (
        <div className="admin-form">
          <label htmlFor="email-category">Category</label>
          <select
            id="email-category"
            value={draft.category}
            onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as EmailCategory }))}
          >
            {(Object.keys(EMAIL_CATEGORY_LABELS) as EmailCategory[]).map((category) => (
              <option key={category} value={category}>
                {EMAIL_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>

          <label htmlFor="email-subject">Subject</label>
          <input
            id="email-subject"
            value={draft.subject}
            onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
          />

          <label htmlFor="email-body">Message</label>
          <textarea
            id="email-body"
            rows={10}
            value={draft.body}
            onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
          />

          <p className="admin-recipient-count">
            {members === null ? "Loading recipients..." : `This will go to ${recipientCount} account${recipientCount === 1 ? "" : "s"}.`}
          </p>

          <div className="admin-form__actions">
            <button type="button" className="btn btn--primary" onClick={startReview}>
              Review and send
            </button>
          </div>

          {status && <p className={`admin-status admin-status--${status.type}`}>{status.message}</p>}
        </div>
      ) : (
        <div className="admin-form">
          <p>
            You're about to send this to <strong>{recipientCount}</strong> account{recipientCount === 1 ? "" : "s"}{" "}
            under <strong>{EMAIL_CATEGORY_LABELS[draft.category]}</strong>:
          </p>
          <div className="admin-list-item">
            <div>
              <p className="admin-list-item__meta">Subject</p>
              <h3>{draft.subject}</h3>
              <p className="admin-email-preview-body">{draft.body}</p>
            </div>
          </div>

          <div className="admin-form__actions">
            <button type="button" className="btn btn--primary" onClick={handleSend} disabled={sending}>
              {sending ? "Sending..." : `Confirm and send to ${recipientCount}`}
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setReviewing(false)} disabled={sending}>
              Back
            </button>
          </div>

          {status && <p className={`admin-status admin-status--${status.type}`}>{status.message}</p>}
        </div>
      )}

      <h2>Sent emails</h2>
      {!campaigns ? (
        <p>Loading...</p>
      ) : campaigns.length === 0 ? (
        <p>No emails sent yet.</p>
      ) : (
        <div className="admin-list">
          {campaigns.map((campaign) => (
            <div className="admin-list-item" key={campaign.id}>
              <div>
                <p className="admin-list-item__meta">
                  {new Date(campaign.sentAt).toLocaleString()} · {EMAIL_CATEGORY_LABELS[campaign.category]} · sent by{" "}
                  {campaign.sentBy}
                </p>
                <h3>{campaign.subject}</h3>
                <p>
                  {campaign.recipientCount} recipient{campaign.recipientCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
