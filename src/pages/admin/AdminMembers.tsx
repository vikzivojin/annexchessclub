import { useEffect, useState } from "react";
import { fetchAllMembers, updateMemberRole, updateMembership } from "../../firebase/members";
import { useAuth } from "../../auth/AuthContext";
import type { MemberProfile, MemberRole, MembershipStatus } from "../../firebase/types";
import { formatGender } from "../../data/profile";
import { isDiscountEligible, membershipPlans, suggestExpiryDate } from "../../data/membership";

function toDateInputValue(epochMillis: number | null): string {
  if (!epochMillis) return "";
  return new Date(epochMillis).toISOString().slice(0, 10);
}

function fromDateInputValue(value: string): number | null {
  if (!value) return null;
  // Treat the picked date as end-of-day local time so an expiry date of
  // "today" doesn't read as already expired.
  const date = new Date(`${value}T23:59:59`);
  return date.getTime();
}

export function AdminMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingUid, setSavingUid] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { membershipType: MembershipStatus; expiryInput: string }>>({});

  useEffect(() => {
    fetchAllMembers()
      .then((fetched) => {
        setMembers(fetched);
        const initialDrafts: Record<string, { membershipType: MembershipStatus; expiryInput: string }> = {};
        fetched.forEach((member) => {
          initialDrafts[member.uid] = {
            membershipType: member.membershipType,
            expiryInput: toDateInputValue(member.membershipExpiresAt),
          };
        });
        setDrafts(initialDrafts);
      })
      .catch(() => setError("Couldn't load members. Please refresh and try again."));
  }, []);

  const handleRoleChange = async (uid: string, role: MemberRole) => {
    setSavingUid(uid);
    setError(null);
    try {
      await updateMemberRole(uid, role);
      setMembers((current) => current?.map((member) => (member.uid === uid ? { ...member, role } : member)) ?? null);
    } catch {
      setError("Couldn't update that member's role. Please try again.");
    } finally {
      setSavingUid(null);
    }
  };

  const handlePlanChange = (uid: string, membershipType: MembershipStatus) => {
    setDrafts((current) => {
      const existing = current[uid] ?? { membershipType, expiryInput: "" };
      // Prefill a suggested expiry date when a real plan is picked and no
      // date has been set yet; leave a manually-set date alone.
      const expiryInput =
        membershipType === "none"
          ? ""
          : existing.expiryInput || toDateInputValue(suggestExpiryDate(membershipType).getTime());
      return { ...current, [uid]: { membershipType, expiryInput } };
    });
  };

  const handleExpiryChange = (uid: string, expiryInput: string) => {
    setDrafts((current) => ({
      ...current,
      [uid]: { ...(current[uid] ?? { membershipType: "none" as MembershipStatus }), expiryInput },
    }));
  };

  const handleSaveMembership = async (uid: string) => {
    const draft = drafts[uid];
    if (!draft) return;
    setSavingUid(uid);
    setError(null);
    try {
      const membershipExpiresAt = draft.membershipType === "none" ? null : fromDateInputValue(draft.expiryInput);
      await updateMembership(uid, draft.membershipType, membershipExpiresAt);
      setMembers(
        (current) =>
          current?.map((member) =>
            member.uid === uid ? { ...member, membershipType: draft.membershipType, membershipExpiresAt } : member,
          ) ?? null,
      );
    } catch {
      setError("Couldn't update that member's membership. Please try again.");
    } finally {
      setSavingUid(null);
    }
  };

  return (
    <div className="admin-panel">
      <h1>Members</h1>
      <p className="admin-panel__lede">
        Everyone who has registered on the site. Set a member's plan and expiry date once you've received payment
        outside the site (Stripe checkout is coming later); promote someone to admin to give them access to this
        portal.
      </p>

      {error && <p className="admin-status admin-status--error">{error}</p>}

      {!members ? (
        <p>Loading...</p>
      ) : members.length === 0 ? (
        <p>No one has registered yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Age / discount</th>
                <th>Membership</th>
                <th>Expires</th>
                <th></th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const draft = drafts[member.uid] ?? {
                  membershipType: member.membershipType,
                  expiryInput: toDateInputValue(member.membershipExpiresAt),
                };
                const eligible = isDiscountEligible(member.dateOfBirth);
                const isSaving = savingUid === member.uid;

                return (
                  <tr key={member.uid}>
                    <td>{member.displayName}</td>
                    <td>{member.email}</td>
                    <td>
                      {formatGender(member.gender)}
                      {eligible && <span className="admin-badge"> 20% discount</span>}
                    </td>
                    <td>
                      <select
                        value={draft.membershipType}
                        disabled={isSaving}
                        onChange={(event) => handlePlanChange(member.uid, event.target.value as MembershipStatus)}
                      >
                        <option value="none">Non-member</option>
                        {membershipPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.label} (${plan.price})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="date"
                        value={draft.expiryInput}
                        disabled={isSaving || draft.membershipType === "none"}
                        onChange={(event) => handleExpiryChange(member.uid, event.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--secondary"
                        disabled={isSaving}
                        onClick={() => handleSaveMembership(member.uid)}
                      >
                        Save
                      </button>
                    </td>
                    <td>
                      <select
                        value={member.role}
                        disabled={savingUid === member.uid || member.uid === user?.uid}
                        onChange={(event) => handleRoleChange(member.uid, event.target.value as MemberRole)}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
