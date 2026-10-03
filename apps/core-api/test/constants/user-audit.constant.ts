export const USER_AUDIT_TEST = {
  EMAIL: 'audit-target@support-tests.realtime-wallet-payments.com',
  ADMIN_EMAIL: 'admin@realtime-wallet-payments.com',
  SUSPEND_PATH: (userId: string): string => `/users/${userId}/suspend`,
  REACTIVATE_PATH: (userId: string): string => `/users/${userId}/reactivate`,
  ENTITY_TYPE: 'User',
  SUSPENDED: 'USER_SUSPENDED',
  REACTIVATED: 'USER_REACTIVATED',
  CREATED_STATUS: 201
} as const;
