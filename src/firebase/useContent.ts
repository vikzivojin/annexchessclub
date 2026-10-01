import { useEffect, useState } from "react";
import { fetchActiveSchedule, fetchAnnouncements } from "./content";
import type { Announcement, ScheduleItem } from "./types";
import { weeklySchedule as staticSchedule } from "../data/clubInfo";

// These hooks fetch admin-managed content from Firestore, but fall back to
// the static copy in src/data/clubInfo.ts if Firestore has nothing yet (for
// example, right after the site launches and before an admin has entered
// anything through the portal) or the request fails.

export function useScheduleItems() {
  const [items, setItems] = useState<ScheduleItem[]>(
    staticSchedule.map((item, index) => ({
      id: `static-${index}`,
      order: index,
      archived: false,
      eventType: "meeting",
      sections: "",
      tournamentDays: [],
      rounds: [],
      classDates: [],
      meetingDate: "",
      ...item,
    })),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Only ever shows active (non-archived) items to visitors.
    fetchActiveSchedule()
      .then((result) => {
        if (!cancelled && result.length > 0) setItems(result);
      })
      .catch(() => {
        // keep the static fallback
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading };
}

export function useAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAnnouncements()
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch(() => {
        // no announcements to show
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading };
}
