import { useEffect, useState } from "react";
import { fetchRegistrationsForEvent } from "../../firebase/content";
import { fetchAllMembers } from "../../firebase/members";
import { calculateAge } from "../../data/membership";
import { formatPrice } from "../../data/pricing";
import type { ScheduleItem } from "../../firebase/types";

type AdminRegistrantsProps = {
  item: ScheduleItem;
  onClose: () => void;
};

type RegistrantRow = {
  id: string;
  name: string;
  cfcId: string;
  age: number | null;
  section: string;
  createdAt: number;
  price: number;
};

// A plain dollar total, distinct from formatPrice's "Free" wording, which
// reads oddly for a sum across registrants.
function formatTotal(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

export function AdminRegistrants({ item, onClose }: AdminRegistrantsProps) {
  const [rows, setRows] = useState<RegistrantRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Close on Escape so the modal behaves like other dialogs on the site.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setError(null);
    Promise.all([fetchRegistrationsForEvent(item.id), fetchAllMembers()])
      .then(([registrations, members]) => {
        if (cancelled) return;
        const memberByUid = new Map(members.map((member) => [member.uid, member]));
        const built = registrations.map((registration) => {
          const member = memberByUid.get(registration.uid);
          return {
            id: registration.id,
            name: member?.displayName ?? "(unknown member)",
            cfcId: member?.cfcId ?? "—",
            age: member ? calculateAge(member.dateOfBirth) : null,
            section: registration.section ?? "",
            createdAt: registration.createdAt,
            price: registration.price,
          };
        });
        // Ordered by section (when the event has them), then alphabetically
        // by name within each section.
        built.sort((a, b) => {
          const sectionCompare = a.section.localeCompare(b.section);
          if (sectionCompare !== 0) return sectionCompare;
          return a.name.localeCompare(b.name);
        });
        setRows(built);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load registrants. Please try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  const showSection = item.eventType === "tournament" && !!rows?.some((row) => row.section);
  const totalPaid = rows?.reduce((sum, row) => sum + (Number.isFinite(row.price) ? row.price : 0), 0) ?? 0;

  return (
    <div className="registrants-modal__overlay" onClick={onClose}>
      <div
        className="registrants-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registrants-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="registrants-modal__close" aria-label="Close" onClick={onClose}>
          &times;
        </button>

        <h2 id="registrants-modal-title">Registrants — {item.title}</h2>

        {error && <p className="admin-status admin-status--error">{error}</p>}

        {!rows ? (
          <p>Loading...</p>
        ) : rows.length === 0 ? (
          <p>No one has registered yet.</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    {showSection && <th>Section</th>}
                    <th>Name</th>
                    <th>CFC ID</th>
                    <th>Age</th>
                    <th>Registered</th>
                    <th>Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {showSection && <td>{row.section || "—"}</td>}
                      <td>{row.name}</td>
                      <td>{row.cfcId}</td>
                      <td>{row.age ?? "—"}</td>
                      <td>{new Date(row.createdAt).toLocaleString()}</td>
                      <td>{formatPrice(row.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="registrants-modal__summary">
              {rows.length} registrant{rows.length === 1 ? "" : "s"} · {formatTotal(totalPaid)} total paid
            </p>
          </>
        )}
      </div>
    </div>
  );
}
