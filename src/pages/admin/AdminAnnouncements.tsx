import { useEffect, useState, type FormEvent } from "react";
import { createAnnouncement, deleteAnnouncement, fetchAnnouncements, saveAnnouncement } from "../../firebase/content";
import type { Announcement } from "../../firebase/types";

export function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    fetchAnnouncements()
      .then(setItems)
      .catch(() => setStatus({ type: "error", message: "Couldn't load announcements." }));
  };

  useEffect(load, []);

  const startEdit = (item: Announcement) => {
    setEditingId(item.id);
    setTitle(item.title);
    setBody(item.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      if (editingId) {
        await saveAnnouncement(editingId, title, body);
        setStatus({ type: "success", message: "Saved." });
      } else {
        await createAnnouncement(title, body);
        setStatus({ type: "success", message: "Posted." });
      }
      cancelEdit();
      load();
    } catch {
      setStatus({ type: "error", message: "Couldn't save that announcement. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setStatus(null);
    try {
      await deleteAnnouncement(id);
      if (editingId === id) cancelEdit();
      load();
    } catch {
      setStatus({ type: "error", message: "Couldn't delete that announcement. Please try again." });
    }
  };

  return (
    <div className="admin-panel">
      <h1>Announcements</h1>
      <p className="admin-panel__lede">
        Posted announcements show on the home page, most recent first. You can edit or remove one at any time.
      </p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label htmlFor="announcement-title">Title</label>
        <input id="announcement-title" required value={title} onChange={(event) => setTitle(event.target.value)} />

        <label htmlFor="announcement-body">Message</label>
        <textarea id="announcement-body" required value={body} onChange={(event) => setBody(event.target.value)} />

        <div className="admin-form__actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {editingId ? "Save changes" : "Post announcement"}
          </button>
          {editingId && (
            <button type="button" className="btn btn--secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>

        {status && <p className={`admin-status admin-status--${status.type}`}>{status.message}</p>}
      </form>

      {!items ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No announcements yet.</p>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <div className="admin-list-item" key={item.id}>
              <div>
                <p className="admin-list-item__meta">{new Date(item.createdAt).toLocaleDateString()}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
              <div className="admin-form__actions">
                <button type="button" className="btn btn--secondary" onClick={() => startEdit(item)}>
                  Edit
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
