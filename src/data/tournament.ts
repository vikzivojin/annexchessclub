// Tournament sections are stored as a single free-text, comma-separated
// field on the schedule item (e.g. "Crown, U1800, U1400"), rather than a
// proper array field, to avoid a bigger migration of the admin form. This
// parses that text into the list of selectable options used when a
// registrant confirms which section they're playing in.
export function parseSections(sections: string): string[] {
  return sections
    .split(",")
    .map((section) => section.trim())
    .filter(Boolean);
}
