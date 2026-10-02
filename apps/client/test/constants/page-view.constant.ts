export const PAGE_VIEW_TEST = {
  API: 'http://localhost:3000/api/v1',
  WALLETS: 'http://localhost:3000/api/v1/wallets',
  NOTIFICATIONS: 'http://localhost:3000/api/v1/notifications',
  TELEMETRY: 'http://localhost:3000/api/v1/telemetry/page-view',
  GET: 'GET',
  START: 1_000_000,
  LATER: 1_007_000,
  WALLET_ROUTE: '/wallet',
  ADMIN_USER_ROUTE: '/admin/users/:id'
} as const;
