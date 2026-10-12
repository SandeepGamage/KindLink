import { userService, type User } from './user.service';
import type {
  VolunteerApplication,
  VolunteerApplicationStatus,
} from '@/types/volunteer-application';

/**
 * Volunteer applications are not a separate collection. They are volunteer
 * `User` documents, and `approvalStatus` is the decision. Registration sets it
 * to 'pending', and the admin rules on it via `PUT /admin/users/:id/approval`.
 * This service maps those users into the shape the approvals screens render.
 */

const STATUS_FROM_API: Record<NonNullable<User['approvalStatus']>, VolunteerApplicationStatus> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

/** `/uploads/documents/nic-abc.jpg` -> `nic-abc.jpg`. */
const fileNameFromPath = (path: string) => path.split(/[\\/]/).pop() ?? '';

export function toVolunteerApplication(user: User): VolunteerApplication {
  const idDocument = user.idDocument ?? '';
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile ?? '',
    profileImage: user.profileImage || undefined,
    availability: user.availability ?? [],
    idDocument: { fileName: fileNameFromPath(idDocument), uri: idDocument },
    appliedAt: user.createdAt ?? '',
    reviewedAt: user.approvalReviewedAt ?? null,
    // Volunteers created before approvals existed have no stored status. The
    // schema default for them is 'approved'.
    status: STATUS_FROM_API[user.approvalStatus ?? 'approved'],
  };
}

export const volunteerApplicationService = {
  /** Every volunteer in any status. The screens filter by status on the client. */
  getApplications: async (): Promise<VolunteerApplication[]> => {
    const users = await userService.getAllUsers({ role: 'volunteer' });
    return users.map(toVolunteerApplication);
  },

  approve: (id: string) => userService.updateApprovalStatus(id, 'approved'),

  reject: (id: string) => userService.updateApprovalStatus(id, 'rejected'),
};
