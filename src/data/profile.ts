import type { Gender } from "../firebase/types";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export function formatGender(gender: Gender): string {
  return GENDER_OPTIONS.find((option) => option.value === gender)?.label ?? gender;
}
