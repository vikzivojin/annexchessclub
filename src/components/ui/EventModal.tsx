import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { fetchMyRegistration, registerForEvent } from "../../firebase/content";
import { formatPrice } from "../../data/pricing";
import { formatDateDisplay } from "../../data/dates";
import { parseSections } from "../../data/tournament";
import type { EventRegistration, ScheduleItem } from "../../firebase/types";
import { Button } from "./Button";
import "./EventModal.scss";

type EventModalProps = {
  item: ScheduleItem;
  onClose: () => void;
};

export function EventModal({ item, onClose }: EventModalProps) {
  const { user, profile } = useAuth();
  const [checking, setChecking] = useState(!!user);
  const [existingRegistration, setExistingRegistration] = useState<EventRegistration | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [byeRounds, setByeRounds] = useState<string[]>([]);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMember = profile ? profile.membershipType !== "none" : false;
  const applicablePrice = isMember ? item.memberPrice : item.nonMemberPrice;

  const isTournament = item.eventType === "tournament";
  const sectionOptions = isTournament ? parseSections(item.sections) : [];
  const hasSections = sectionOptions.length > 0;
  const hasRounds = isTournament && item.rounds.length > 0;
  const needsConfirmation = isTournament && (hasSections || hasRounds);

  useEffect(() => {
    // Close on Escape so the modal behaves like other dialogs on the site.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    // Nothing to check for a signed-out visitor; the "create an account"
    // message is shown instead, regardless of `checking`.
    if (!user) return;
    let cancelled = false;
    setChecking(true);
    fetchMyRegistration(item.id, user.uid)
      .then((existing) => {
        if (!cancelled) setExistingRegistration(existing);
      })
      .catch(() => {
        // If the check fails, fall through to letting them try to register.
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item.id, user]);

  const startConfirming = () => {
    setError(null);
    setConfirming(true);
  };

  const toggleByeRound = (label: string) => {
    setByeRounds((current) => (current.includes(label) ? current.filter((l) => l !== label) : [...current, label]));
  };

  const handleRegister = async () => {
    if (!user) return;
    if (hasSections && !selectedSection) {
      setError("Please select the section you wish to play in.");
      return;
    }
    setRegistering(true);
    setError(null);
    try {
      const registrationId = await registerForEvent({
        scheduleItemId: item.id,
        uid: user.uid,
        price: applicablePrice,
        isMember,
        section: hasSections ? selectedSection : undefined,
        byeRounds: hasRounds ? byeRounds : undefined,
      });
      setExistingRegistration({
        id: registrationId,
        scheduleItemId: item.id,
        uid: user.uid,
        price: applicablePrice,
        isMember,
        createdAt: Date.now(),
        section: hasSections ? selectedSection : undefined,
        byeRounds: hasRounds ? byeRounds : undefined,
      });
      setConfirming(false);
    } catch {
      setError("Couldn't register for this event. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="event-modal__overlay" onClick={onClose}>
      <div
        className="event-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="event-modal__close" aria-label="Close" onClick={onClose}>
          &times;
        </button>

        <span className="event-modal__time">{item.time}</span>
        <h2 id="event-modal-title">{item.title}</h2>
        <p className="event-modal__description">{item.description}</p>

        {item.eventType === "tournament" && (
          <div className="event-modal__details">
            {item.sections && (
              <p>
                <strong>Sections:</strong> {item.sections}
              </p>
            )}
            {item.tournamentDays.length > 0 && (
              <p>
                <strong>Days:</strong> {item.tournamentDays.map(formatDateDisplay).join(", ")}
              </p>
            )}
            {item.rounds.length > 0 && (
              <div>
                <strong>Rounds:</strong>
                <ul>
                  {item.rounds.map((round, index) => (
                    <li key={index}>
                      {round.label}: {formatDateDisplay(round.date)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {item.eventType === "class" && item.classDates.length > 0 && (
          <p className="event-modal__details">
            <strong>Class dates:</strong> {item.classDates.map(formatDateDisplay).join(", ")}
          </p>
        )}

        {item.eventType === "meeting" && item.meetingDate && (
          <p className="event-modal__details">
            <strong>Date:</strong> {formatDateDisplay(item.meetingDate)}
          </p>
        )}

        <div className="event-modal__prices">
          <div className={`event-modal__price ${user && isMember ? "is-selected" : ""}`}>
            <span className="event-modal__price-label">Member price</span>
            <span className="event-modal__price-value">{formatPrice(item.memberPrice)}</span>
          </div>
          <div className={`event-modal__price ${user && !isMember ? "is-selected" : ""}`}>
            <span className="event-modal__price-label">Non-member price</span>
            <span className="event-modal__price-value">{formatPrice(item.nonMemberPrice)}</span>
          </div>
        </div>

        <div className="event-modal__register">
          {!user ? (
            <>
              <p className="event-modal__note">Please create an account in order to register for this event.</p>
              <Button to="/register">Create an account</Button>
            </>
          ) : checking ? (
            <p className="event-modal__note">Checking your registration status...</p>
          ) : existingRegistration ? (
            <p className="event-modal__note event-modal__note--success">
              You're registered at the {isMember ? "member" : "non-member"} price of {formatPrice(applicablePrice)}
              {existingRegistration.section && (
                <>
                  , playing in the <strong>{existingRegistration.section}</strong> section
                </>
              )}
              {existingRegistration.byeRounds && existingRegistration.byeRounds.length > 0 && (
                <>
                  , taking a bye in <strong>{existingRegistration.byeRounds.join(", ")}</strong>
                </>
              )}
              . The club will follow up with payment details.
            </p>
          ) : confirming ? (
            <div className="event-modal__confirm">
              {hasSections && (
                <div className="event-modal__confirm-field">
                  <label htmlFor="event-modal-section">Section</label>
                  <select
                    id="event-modal-section"
                    value={selectedSection}
                    onChange={(event) => setSelectedSection(event.target.value)}
                  >
                    <option value="" disabled>
                      Select a section
                    </option>
                    {sectionOptions.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {hasRounds && (
                <div className="event-modal__confirm-field">
                  <span className="event-modal__confirm-label">Rounds you wish to take a bye in</span>
                  <div className="event-modal__bye-list">
                    {item.rounds.map((round, index) => (
                      <label className="event-modal__bye-option" key={index}>
                        <input
                          type="checkbox"
                          checked={byeRounds.includes(round.label)}
                          onChange={() => toggleByeRound(round.label)}
                        />
                        {round.label} ({formatDateDisplay(round.date)})
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="event-modal__confirm-actions">
                <Button onClick={handleRegister} disabled={registering}>
                  {registering ? "Registering..." : `Confirm registration for ${formatPrice(applicablePrice)}`}
                </Button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setConfirming(false)}
                  disabled={registering}
                >
                  Back
                </button>
              </div>
              {error && <p className="event-modal__note event-modal__note--error">{error}</p>}
            </div>
          ) : (
            <>
              <Button onClick={needsConfirmation ? startConfirming : handleRegister} disabled={registering}>
                {registering ? "Registering..." : `Register for ${formatPrice(applicablePrice)}`}
              </Button>
              {error && <p className="event-modal__note event-modal__note--error">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
