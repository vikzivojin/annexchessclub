import { useEffect, useState, type FormEvent } from "react";
import {
  createScheduleItem,
  deleteScheduleItem,
  fetchSchedule,
  saveScheduleItem,
  setScheduleItemArchived,
} from "../../firebase/content";
import type { EventType, ScheduleItem, ScheduleRound } from "../../firebase/types";
import { DateListEditor, RoundsEditor } from "./ScheduleEventFields";
import { AdminRegistrants } from "./AdminRegistrants";

const emptyDraft = {
  title: "",
  time: "",
  description: "",
  memberPrice: "0",
  nonMemberPrice: "0",
  eventType: "meeting" as EventType,
  sections: "",
  tournamentDays: [] as string[],
  rounds: [] as ScheduleRound[],
  classDates: [] as string[],
  meetingDate: "",
};

export function AdminSchedule() {
  const [items, setItems] = useState<ScheduleItem[] | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewingRegistrantsItem, setViewingRegistrantsItem] = useState<ScheduleItem | null>(null);

  const load = () => {
    fetchSchedule()
      .then(setItems)
      .catch(() => setStatus({ type: "error", message: "Couldn't load the schedule." }));
  };

  useEffect(load, []);

  const activeItems = items?.filter((item) => !item.archived) ?? [];
  const archivedItems = items?.filter((item) => item.archived) ?? [];
  const editingItem = items?.find((item) => item.id === editingId) ?? null;

  const startEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setStatus(null);
    setDraft({
      title: item.title,
      time: item.time,
      description: item.description,
      memberPrice: String(item.memberPrice ?? 0),
      nonMemberPrice: String(item.nonMemberPrice ?? 0),
      eventType: item.eventType,
      sections: item.sections,
      tournamentDays: item.tournamentDays,
      rounds: item.rounds,
      classDates: item.classDates,
      meetingDate: item.meetingDate,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (draft.eventType === "tournament") {
      if (!draft.sections.trim()) {
        setStatus({ type: "error", message: "Please enter the tournament's sections." });
        return;
      }
      if (draft.tournamentDays.length === 0) {
        setStatus({ type: "error", message: "Please add at least one day the tournament runs." });
        return;
      }
    }
    if (draft.eventType === "class" && draft.classDates.length === 0) {
      setStatus({ type: "error", message: "Please add at least one class date." });
      return;
    }
    if (draft.eventType === "meeting" && !draft.meetingDate) {
      setStatus({ type: "error", message: "Please select the meeting date." });
      return;
    }

    setSubmitting(true);
    try {
      const memberPrice = Number.parseFloat(draft.memberPrice) || 0;
      const nonMemberPrice = Number.parseFloat(draft.nonMemberPrice) || 0;
      const payload = {
        title: draft.title,
        time: draft.time,
        description: draft.description,
        memberPrice,
        nonMemberPrice,
        eventType: draft.eventType,
        sections: draft.eventType === "tournament" ? draft.sections.trim() : "",
        tournamentDays: draft.eventType === "tournament" ? draft.tournamentDays : [],
        rounds: draft.eventType === "tournament" ? draft.rounds : [],
        classDates: draft.eventType === "class" ? draft.classDates : [],
        meetingDate: draft.eventType === "meeting" ? draft.meetingDate : "",
      };
      if (editingId) {
        await saveScheduleItem({
          id: editingId,
          order: editingItem?.order ?? 0,
          archived: editingItem?.archived ?? false,
          ...payload,
        });
      } else {
        await createScheduleItem({ ...payload, order: items?.length ?? 0, archived: false });
      }
      setStatus({ type: "success", message: "Saved." });
      cancelEdit();
      load();
    } catch {
      setStatus({ type: "error", message: "Couldn't save that item. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (!editingId || !editingItem) return;
    const archived = !editingItem.archived;
    setBusy(true);
    setStatus(null);
    try {
      await setScheduleItemArchived(editingId, archived);
      cancelEdit();
      load();
    } catch {
      setStatus({
        type: "error",
        message: archived ? "Couldn't archive that item. Please try again." : "Couldn't restore that item. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setBusy(true);
    setStatus(null);
    try {
      await deleteScheduleItem(editingId);
      cancelEdit();
      load();
    } catch {
      setStatus({ type: "error", message: "Couldn't delete that item. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-panel">
      <h1>Schedule</h1>
      <p className="admin-panel__lede">
        These entries appear on the public Schedule page, in the order listed below. Visitors can click one to see
        full details and register at the price for their membership status. Click an entry below to edit it, or to
        archive or delete it.
      </p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label htmlFor="schedule-title">Title</label>
        <input
          id="schedule-title"
          required
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
        />

        <label htmlFor="schedule-time">Time</label>
        <input
          id="schedule-time"
          required
          placeholder="e.g. 6:30 PM"
          value={draft.time}
          onChange={(event) => setDraft((current) => ({ ...current, time: event.target.value }))}
        />

        <label htmlFor="schedule-description">Description</label>
        <textarea
          id="schedule-description"
          required
          value={draft.description}
          onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
        />

        <label htmlFor="schedule-event-type">Event type</label>
        <select
          id="schedule-event-type"
          value={draft.eventType}
          onChange={(event) => setDraft((current) => ({ ...current, eventType: event.target.value as EventType }))}
        >
          <option value="tournament">Tournament</option>
          <option value="class">Class</option>
          <option value="meeting">Meeting</option>
        </select>

        {draft.eventType === "tournament" && (
          <>
            <label htmlFor="schedule-sections">Sections</label>
            <input
              id="schedule-sections"
              placeholder="e.g. Crown, U1800, U1400"
              value={draft.sections}
              onChange={(event) => setDraft((current) => ({ ...current, sections: event.target.value }))}
            />

            <DateListEditor
              label="Days the tournament runs"
              dates={draft.tournamentDays}
              onChange={(tournamentDays) =>
                setDraft((current) => ({
                  ...current,
                  tournamentDays,
                  // Drop any round that pointed at a day no longer in the list.
                  rounds: current.rounds.filter((round) => tournamentDays.includes(round.date)),
                }))
              }
            />

            <RoundsEditor
              rounds={draft.rounds}
              days={draft.tournamentDays}
              onChange={(rounds) => setDraft((current) => ({ ...current, rounds }))}
            />
          </>
        )}

        {draft.eventType === "class" && (
          <DateListEditor
            label="Class dates"
            dates={draft.classDates}
            onChange={(classDates) => setDraft((current) => ({ ...current, classDates }))}
          />
        )}

        {draft.eventType === "meeting" && (
          <>
            <label htmlFor="schedule-meeting-date">Meeting date</label>
            <input
              id="schedule-meeting-date"
              type="date"
              required
              value={draft.meetingDate}
              onChange={(event) => setDraft((current) => ({ ...current, meetingDate: event.target.value }))}
            />
          </>
        )}

        <div className="admin-form__row">
          <div>
            <label htmlFor="schedule-member-price">Member price ($)</label>
            <input
              id="schedule-member-price"
              type="number"
              min={0}
              step={0.01}
              required
              value={draft.memberPrice}
              onChange={(event) => setDraft((current) => ({ ...current, memberPrice: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="schedule-non-member-price">Non-member price ($)</label>
            <input
              id="schedule-non-member-price"
              type="number"
              min={0}
              step={0.01}
              required
              value={draft.nonMemberPrice}
              onChange={(event) => setDraft((current) => ({ ...current, nonMemberPrice: event.target.value }))}
            />
          </div>
        </div>

        <div className="admin-form__actions">
          <button type="submit" className="btn btn--primary" disabled={submitting || busy}>
            {editingId ? "Save changes" : "Add item"}
          </button>
          {editingId && (
            <>
              <button type="button" className="btn btn--secondary" onClick={cancelEdit} disabled={busy}>
                Cancel
              </button>
              <button type="button" className="btn btn--secondary" onClick={handleArchiveToggle} disabled={busy}>
                {editingItem?.archived ? "Restore" : "Archive"}
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleDelete} disabled={busy}>
                Delete{editingItem?.archived ? " permanently" : ""}
              </button>
            </>
          )}
        </div>

        {status && <p className={`admin-status admin-status--${status.type}`}>{status.message}</p>}
      </form>

      {!items ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="admin-list">
            {activeItems.length === 0 ? (
              <p>No active schedule items. Add one above.</p>
            ) : (
              activeItems.map((item) => (
                <div className={`admin-list-item${editingId === item.id ? " is-editing" : ""}`} key={item.id}>
                  <h3>{item.title}</h3>
                  <div className="admin-form__actions">
                    <button type="button" className="btn btn--secondary" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn--secondary" onClick={() => setViewingRegistrantsItem(item)}>
                      Registrants
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {archivedItems.length > 0 && (
            <>
              <h2>Archived</h2>
              <p className="admin-panel__lede">
                Kept for the record. Not shown on the public Schedule page; open one to restore or delete it.
              </p>
              <div className="admin-list">
                {archivedItems.map((item) => (
                  <div className={`admin-list-item${editingId === item.id ? " is-editing" : ""}`} key={item.id}>
                    <h3>{item.title}</h3>
                    <div className="admin-form__actions">
                      <button type="button" className="btn btn--secondary" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={() => setViewingRegistrantsItem(item)}
                      >
                        Registrants
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {viewingRegistrantsItem && (
        <AdminRegistrants item={viewingRegistrantsItem} onClose={() => setViewingRegistrantsItem(null)} />
      )}
    </div>
  );
}
