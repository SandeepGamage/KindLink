import { FunctionalColors, Palette } from '@/constants/theme';
import { AssistanceRequest } from '@/types/appointment';

export type CommitmentStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled';

export const STATUS_META: Record<CommitmentStatus, { label: string; bg: string; color: string; footerBg: string; footerText: string; caption: string; action: string }> = {
  'upcoming': { label: 'Upcoming', bg: Palette.blueTint, color: Palette.secondary, footerBg: '#F7FBFF', footerText: '#5D7182', caption: 'Scheduled', action: 'View details' },
  'in-progress': { label: 'In Progress', bg: FunctionalColors.warningBg, color: FunctionalColors.warningText, footerBg: FunctionalColors.warningBg, footerText: FunctionalColors.warningText, caption: 'Active now', action: 'Check out / complete' },
  'completed': { label: 'Completed', bg: FunctionalColors.successBg, color: FunctionalColors.successText, footerBg: FunctionalColors.successBg, footerText: FunctionalColors.successText, caption: 'Finished', action: 'View summary' },
  'cancelled': { label: 'Cancelled', bg: FunctionalColors.dangerBg, color: FunctionalColors.dangerText, footerBg: '#F7FBFF', footerText: '#5D7182', caption: 'Not attended', action: 'View cancellation details' },
};

/**
 * Maps a persisted appointment status to a commitment tab; pending requests aren't commitments yet.
 * Requests the volunteer declined (and that aren't theirs) land in the cancelled tab.
 */
export function deriveCommitmentStatus(request: AssistanceRequest, userId?: string): CommitmentStatus | null {
  const providerId = typeof request.provider === 'string' ? request.provider : request.provider?._id;
  const isDeclinedByUser =
    Boolean(
      userId &&
      request.declinedBy?.some((id) => {
        const val = typeof id === 'object' && id !== null && '_id' in id ? (id as any)._id : id;
        return String(val) === String(userId);
      })
    );

  if (isDeclinedByUser && providerId !== userId) {
    return 'cancelled';
  }
  if (request.status === 'completed') return 'completed';
  if (request.status === 'cancelled') return 'cancelled';
  if (request.status === 'in-progress' || (request.status as string) === 'in_progress') return 'in-progress';
  if (request.status === 'accepted') return 'upcoming';
  return null;
}
