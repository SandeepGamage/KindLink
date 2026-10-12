/**
 * A volunteer's pending verification request, as the admin approvals screen
 * needs it.
 *
 * Mapped from a volunteer `User` by `services/volunteer-application.service.ts`.
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
  /** ISO timestamp of the approve/reject decision. Null while pending. */
  reviewedAt?: string | null;
  status: VolunteerApplicationStatus;
}
