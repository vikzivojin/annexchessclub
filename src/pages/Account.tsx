import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { logoutMember, setAutoRenew, setEmailPreferences } from "../firebase/members";
import { Button } from "../components/ui/Button";
import { formatGender } from "../data/profile";
import { formatMembershipLabel, getPlanById, getPlanPrice, isDiscountEligible } from "../data/membership";
import type { MemberProfile } from "../firebase/types";
import "./Account.scss";

type EmailOptOutField = "emailOptOutGeneral" | "emailOptOutTournamentReminders" | "emailOptOutRenewalReminders";

const emailOptOutOptions: { field: EmailOptOutField; label: string }[] = [
  { field: "emailOptOutGeneral", label: "Opt out of general club emails" },
  { field: "emailOptOutTournamentReminders", label: "Opt out of tournament reminders" },
  { field: "emailOptOutRenewalReminders", label: "Opt out of renewal reminders" },
];

export function Account() {
  const { user, profile, isAdmin, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [savingAutoRenew, setSavingAutoRenew] = useState(false);
  const [autoRenewError, setAutoRenewError] = useState<string | null>(null);
  const [savingEmailPref, setSavingEmailPref] = useState<EmailOptOutField | null>(null);
  const [emailPrefError, setEmailPrefError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logoutMember();
    navigate("/");
  };

  const handleAutoRenewToggle = async (checked: boolean) => {
    if (!profile) return;
    setSavingAutoRenew(true);
    setAutoRenewError(null);
    try {
      await setAutoRenew(profile.uid, checked);
      await refreshProfile();
    } catch {
      setAutoRenewError("Couldn't update that. Please try again.");
    } finally {
      setSavingAutoRenew(false);
    }
  };

  const handleEmailPrefToggle = async (field: EmailOptOutField, checked: boolean) => {
    if (!profile) return;
    setSavingEmailPref(field);
    setEmailPrefError(null);
    try {
      await setEmailPreferences(profile.uid, { [field]: checked } as Partial<MemberProfile>);
      await refreshProfile();
    } catch {
      setEmailPrefError("Couldn't update that. Please try again.");
    } finally {
      setSavingEmailPref(null);
    }
  };

  const hasMembership = profile && profile.membershipType !== "none";
  const plan = profile && hasMembership ? getPlanById(profile.membershipType) : undefined;
  const discountEligible = profile ? isDiscountEligible(profile.dateOfBirth) : false;
  const price = plan ? getPlanPrice(plan, profile?.dateOfBirth) : undefined;

  return (
    <section className="page-header">
      <div className="page-header__inner">
        <span className="page-header__eyebrow">Your account</span>
        <h1>{profile?.displayName ?? user?.email}</h1>
        <p>{user?.email}</p>
      </div>

      <div className="account-body">
        <div className="account-grid">
          <div className="account-card">
            <h2>Membership</h2>
            {profile && (
              <>
                <p className="account-card__status">
                  {hasMembership ? formatMembershipLabel(profile.membershipType) : "Non-member (no active membership)"}
                </p>
                {hasMembership && (
                  <dl className="account-facts">
                    {price !== undefined && (
                      <div>
                        <dt>Price</dt>
                        <dd>
                          ${price.toFixed(2)}
                          {discountEligible && " (age discount applied)"}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt>Expires</dt>
                      <dd>
                        {profile.membershipExpiresAt
                          ? new Date(profile.membershipExpiresAt).toLocaleDateString()
                          : "Not set"}
                      </dd>
                    </div>
                  </dl>
                )}
                {!hasMembership && discountEligible && (
                  <p className="account-card__note">
                    Based on your date of birth, you'd qualify for the club's 20% age discount on any plan.
                  </p>
                )}
                <label className="account-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.autoRenew}
                    disabled={savingAutoRenew}
                    onChange={(event) => handleAutoRenewToggle(event.target.checked)}
                  />
                  Automatically renew my membership
                </label>
                {autoRenewError && <p className="admin-status admin-status--error">{autoRenewError}</p>}
                {!hasMembership && (
                  <p className="account-card__note">
                    To activate a paid membership, contact the club — online payment is coming soon.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="account-card">
            <h2>Profile</h2>
            {profile && (
              <dl className="account-facts">
                <div>
                  <dt>Gender</dt>
                  <dd>{formatGender(profile.gender)}</dd>
                </div>
                <div>
                  <dt>Date of birth</dt>
                  <dd>{new Date(profile.dateOfBirth).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt>CFC ID</dt>
                  <dd>{profile.cfcId || "Not provided"}</dd>
                </div>
                <div>
                  <dt>FIDE ID</dt>
                  <dd>{profile.fideId || "Not provided"}</dd>
                </div>
              </dl>
            )}
          </div>

          <div className="account-card">
            <h2>Email preferences</h2>
            {profile && (
              <>
                <p className="account-card__note">
                  By default you'll receive all club emails. Opt out of any you don't want below.
                </p>
                {emailOptOutOptions.map(({ field, label }) => (
                  <label className="account-checkbox" key={field}>
                    <input
                      type="checkbox"
                      checked={profile[field]}
                      disabled={savingEmailPref === field}
                      onChange={(event) => handleEmailPrefToggle(field, event.target.checked)}
                    />
                    {label}
                  </label>
                ))}
                {emailPrefError && <p className="admin-status admin-status--error">{emailPrefError}</p>}
              </>
            )}
          </div>

          <div className="account-card">
            <h2>Account</h2>
            <p>
              You're signed in as a {profile?.role === "admin" ? "club administrator" : "member"}.
              {isAdmin && " You have access to the admin portal."}
            </p>
            <div className="account-card__actions">
              {isAdmin && (
                <Button to="/admin" variant="secondary">
                  Go to admin portal
                </Button>
              )}
              <Button onClick={handleLogout} variant="ghost">
                Log out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
