/**
 * A volunteer's pending verification request, as the admin approvals screen
 * needs it.
 *
 * The field names mirror what the sign-up flow actually collects
 * (`mobile/src/app/(auth)/register.tsx` → `SignUpPayload`) so wiring this to a
 * real endpoint later is a mapping, not a redesign.
 */

export type VolunteerApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface VolunteerIdDocument {
  fileName: string;
  /** Empty string when the applicant skipped the upload. */
  uri: string;
}

export interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  mobile: string;
  profileImage?: string;
  /** Helper availability slots, e.g. "Weekends", "Mornings". */
  availability: string[];
  idDocument: VolunteerIdDocument;
  /** ISO timestamp of when the application was submitted. */
  appliedAt: string;
  status: VolunteerApplicationStatus;
}
