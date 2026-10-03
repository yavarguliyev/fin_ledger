import { HTTP_STATUS } from './http-status.constant';

export const DEVICE_TRACKING = {
  ...HTTP_STATUS,
  LOGIN_PATH: '/auth/login',
  SHARED_DEVICES_PATH: '/admin/shared-devices',
  FIRST_EMAIL: 'device-first@integration.test',
  SECOND_EMAIL: 'device-second@integration.test',
  PASSWORD: 'Device#Pass2026',
  REGISTER_PATH: '/auth/register',
  VERIFY_EMAIL_PATH: '/auth/verify-email',
  STAFF_EMAIL: 'admin@realtime-wallet-payments.com',
  ADMIN_EMAIL: 'global_admin@realtime-wallet-payments.com',
  KNOWN_DEVICE: 'integration-device-known',
  OTHER_DEVICE: 'integration-device-other',
  SHARED_DEVICE: 'integration-device-shared',
  SHARED_ACCOUNTS: 2
} as const;
