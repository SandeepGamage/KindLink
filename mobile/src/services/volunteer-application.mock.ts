import type { VolunteerApplication } from '@/types/volunteer-application';

/**
 * Stand-in for the volunteer applications endpoint.
 *
 * TODO: replace with a real `volunteer-application.service.ts` calling
 * `GET /api/admin/volunteer-applications`. Approving and rejecting currently
 * only mutate local screen state — there is no VolunteerApplication model or
 * admin endpoint behind the approvals screen yet.
 *
 * Lives in `services/` rather than beside the screen because every file under
 * `src/app/` is treated as a route by Expo Router.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Applied `ms` before now, as an ISO string. */
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

export const MOCK_VOLUNTEER_APPLICATIONS: VolunteerApplication[] = [
  {
    id: '1',
    name: 'Michael Chang',
    email: 'michael.chang@example.com',
    mobile: '07123 456789',
    profileImage: 'https://i.pravatar.cc/160?img=12',
    availability: ['Weekends', 'Mornings', 'Flexible'],
    idDocument: {
      fileName: 'National_Identity_Card.jpg',
      uri: 'https://picsum.photos/seed/kindlink-id-1/1200/750',
    },
    appliedAt: ago(2 * HOUR),
    status: 'Pending',
  },
  {
    id: '2',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@example.com',
    mobile: '07987 654321',
    profileImage: 'https://i.pravatar.cc/160?img=45',
    // Four slots — exercises the card's "+N more" overflow.
    availability: ['Weekends', 'Afternoons', 'Evenings', 'Flexible'],
    idDocument: {
      fileName: 'Driving_Licence.png',
      uri: 'https://picsum.photos/seed/kindlink-id-2/1200/750',
    },
    appliedAt: ago(DAY + 5 * HOUR),
    status: 'Pending',
  },
  {
    id: '3',
    name: 'Aditha Perera',
    email: 'aditha.perera@example.com',
    mobile: '077 234 5678',
    availability: ['Evenings'],
    idDocument: {
      fileName: 'Student_ID_Card.jpg',
      uri: 'https://picsum.photos/seed/kindlink-id-3/1200/750',
    },
    appliedAt: ago(3 * DAY),
    status: 'Pending',
  },
  {
    id: '4',
    name: 'Nadia Fernando',
    email: 'nadia.fernando@example.com',
    mobile: '',
    profileImage: 'https://i.pravatar.cc/160?img=32',
    // Skipped both optional steps — exercises the empty-state fallbacks.
    availability: [],
    idDocument: { fileName: '', uri: '' },
    appliedAt: ago(4 * DAY),
    status: 'Pending',
  },
];
