import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllMembers } from "../../firebase/members";
import { fetchAnnouncements, fetchSchedule } from "../../firebase/content";

export function AdminDashboard() {
  const [counts, setCounts] = useState<{
    members: number;
    admins: number;
    scheduleItems: number;
    archivedScheduleItems: number;
    announcements: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      const [members, schedule, announcements] = await Promise.all([
        fetchAllMembers(),
        fetchSchedule(),
        fetchAnnouncements(),
      ]);
      if (cancelled) return;
      setCounts({
        members: members.length,
        admins: members.filter((member) => member.role === "admin").length,
        scheduleItems: schedule.filter((item) => !item.archived).length,
        archivedScheduleItems: schedule.filter((item) => item.archived).length,
        announcements: announcements.length,
      });
    }

    loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-panel">
      <h1>Dashboard</h1>
      <p className="admin-panel__lede">A quick look at what's in the club's database right now.</p>

      {!counts ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-stats">
          <div>
            <strong>{counts.members}</strong>
            <span>Members ({counts.admins} admin{counts.admins === 1 ? "" : "s"})</span>
          </div>
          <div>
            <strong>{counts.scheduleItems}</strong>
            <span>Schedule items{counts.archivedScheduleItems > 0 && ` (${counts.archivedScheduleItems} archived)`}</span>
          </div>
          <div>
            <strong>{counts.announcements}</strong>
            <span>Announcements</span>
          </div>
        </div>
      )}

      <p className="admin-panel__links">
        <Link to="/admin/members">Manage members</Link> · <Link to="/admin/schedule">Edit schedule</Link> ·{" "}
        <Link to="/admin/announcements">Post an announcement</Link>
      </p>
    </div>
  );
}
