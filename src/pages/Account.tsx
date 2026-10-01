import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { logoutMember, setAutoRenew } from "../firebase/members";
import { Button } from "../components/ui/Button";
import { formatGender } from "../data/profile";
import { formatMembershipLabel, getPlanById, getPlanPrice, isDiscountEligible } from "../data/membership";
import "./Account.scss";

export function Account() {
  const { user, profile, isAdmin, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [savingAutoRenew, setSavingAutoRenew] = useState(false);
  const [autoRenewError, setAutoRenewError] = useState<string | null>(null);

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
