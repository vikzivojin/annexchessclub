import { useState } from "react";
import type { ScheduleRound } from "../../firebase/types";
import { formatDateDisplay } from "../../data/dates";

type DateListEditorProps = {
  label: string;
  dates: string[];
  onChange: (dates: string[]) => void;
};

// A small add/remove list of dates, used for both the days a tournament
// runs and the dates of a class's sessions.
export function DateListEditor({ label, dates, onChange }: DateListEditorProps) {
  const [draftDate, setDraftDate] = useState("");

  const addDate = () => {
    if (!draftDate || dates.includes(draftDate)) return;
    onChange([...dates, draftDate].sort());
    setDraftDate("");
  };

  const removeDate = (date: string) => {
    onChange(dates.filter((existing) => existing !== date));
  };

  return (
    <div className="date-list-editor">
      <label htmlFor={`${label}-add`}>{label}</label>

      {dates.length > 0 && (
        <ul className="date-list-editor__items">
          {dates.map((date) => (
            <li key={date}>
              <span>{formatDateDisplay(date)}</span>
              <button
                type="button"
                className="date-list-editor__remove"
                aria-label={`Remove ${formatDateDisplay(date)}`}
                onClick={() => removeDate(date)}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="date-list-editor__add">
        <input id={`${label}-add`} type="date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} />
        <button type="button" className="btn btn--secondary" onClick={addDate}>
          Add date
        </button>
      </div>
    </div>
  );
}

type RoundsEditorProps = {
  rounds: ScheduleRound[];
  days: string[];
  onChange: (rounds: ScheduleRound[]) => void;
};

// Each round is a label (e.g. "Round 1") paired with one of the tournament's
// days, which keeps rounds from pointing at a date the tournament isn't
// actually running on.
export function RoundsEditor({ rounds, days, onChange }: RoundsEditorProps) {
  const addRound = () => {
    onChange([...rounds, { label: `Round ${rounds.length + 1}`, date: days[0] ?? "" }]);
  };

  const updateRound = (index: number, patch: Partial<ScheduleRound>) => {
    onChange(rounds.map((round, i) => (i === index ? { ...round, ...patch } : round)));
  };

  const removeRound = (index: number) => {
    onChange(rounds.filter((_, i) => i !== index));
  };

  return (
    <div className="rounds-editor">
      <label>Rounds</label>

      {rounds.length > 0 && (
        <div className="rounds-editor__list">
          {rounds.map((round, index) => (
            <div className="rounds-editor__row" key={index}>
              <input
                type="text"
                aria-label="Round label"
                placeholder="e.g. Round 1"
                value={round.label}
                onChange={(event) => updateRound(index, { label: event.target.value })}
              />
              <select
                aria-label="Round day"
                value={round.date}
                onChange={(event) => updateRound(index, { date: event.target.value })}
              >
                <option value="" disabled>
                  Select a day
                </option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {formatDateDisplay(day)}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn--ghost" onClick={() => removeRound(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="btn btn--secondary" onClick={addRound} disabled={days.length === 0}>
        Add round
      </button>
      {days.length === 0 && (
        <p className="admin-panel__lede">Add at least one tournament day above before adding rounds.</p>
      )}
    </div>
  );
}
