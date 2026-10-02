export const PRESENCE_TEST = {
  STAFF: { userId: 'staff-1', displayName: 'Moderator', role: 'MODERATOR', state: 'OFFLINE', lastSeenAt: '2026-10-01T10:00:00.000Z' },
  OTHER: { userId: 'staff-2', displayName: 'Admin', role: 'ADMIN', state: 'ONLINE', lastSeenAt: null },
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  LATER: '2026-10-01T11:00:00.000Z',
  UNKNOWN: ''
} as const;
