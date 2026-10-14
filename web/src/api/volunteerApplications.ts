/**
 * KindLink Admin Portal — volunteer approvals API.
 * Mirrors mobile/src/services/volunteer-application.service.ts.
 *
 * Volunteer applications are not a separate collection. They are volunteer
 * `User` documents, and `approvalStatus` is the decision. Registration sets it
 * to 'pending', and the admin rules on it via `PUT /admin/users/:id/approval`.
 * This module maps those users into the shape the approvals pages render.
 */

import { api, resolveMediaUrl } from './client';
import { getAllUsers, type ApprovalStatus, type User } from './users';

export type VolunteerApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  mobile: string;
  profileImage?: string;
  /** Helper availability slots, e.g. "Weekends", "Mornings". */
  availability: string[];
  /** `uri` is an absolute URL, or empty when the applicant skipped the upload. */
  idDocument: { fileName: string; uri: string };
  /** ISO timestamp of when the application was submitted. */
  appliedAt: string;
  /** ISO timestamp of the approve/reject decision. Null while pending. */
  reviewedAt: string | null;
  status: VolunteerApplicationStatus;
}

const STATUS_FROM_API: Record<ApprovalStatus, VolunteerApplicationStatus> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

/** `/uploads/documents/nic-abc.jpg` -> `nic-abc.jpg`. */
const fileNameFromPath = (path: string) => path.split(/[\\/]/).pop() ?? '';

function toVolunteerApplication(user: User): VolunteerApplication {
  const idDocument = user.idDocument ?? '';
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile ?? '',
    profileImage: user.profileImage || undefined,
    availability: user.availability ?? [],
    idDocument: { fileName: fileNameFromPath(idDocument), uri: resolveMediaUrl(idDocument) ?? '' },
    appliedAt: user.createdAt ?? '',
    reviewedAt: user.approvalReviewedAt ?? null,
    // Volunteers created before approvals existed have no stored status. The
    // schema default for them is 'approved'.
    status: STATUS_FROM_API[user.approvalStatus ?? 'approved'],
  };
}

/** Every volunteer in any status. The pages filter by status on the client. */
export async function getVolunteerApplications(): Promise<VolunteerApplication[]> {
  const users = await getAllUsers({ role: 'volunteer' });
  return users.map(toVolunteerApplication);
}

function setApprovalStatus(id: string, status: ApprovalStatus): Promise<User> {
  return api.put<User>(`/admin/users/${id}/approval`, { status });
}

export const approveApplication = (id: string) => setApprovalStatus(id, 'approved');

export const rejectApplication = (id: string) => setApprovalStatus(id, 'rejected');

/**
 * When the current decision was made. Volunteers decided before review times
 * were recorded fall back to when they applied.
 */
export const decidedAt = (a: VolunteerApplication) => a.reviewedAt ?? a.appliedAt;
