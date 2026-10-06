import { HTTP_STATUS } from './http-status.constant';

export const AUDIT_LOG_KEYSET_TEST = {
  ...HTTP_STATUS,
  GLOBAL_ADMIN_EMAIL: 'global_admin@realtime-wallet-payments.com',
  PATH: '/audit-logs',
  PAGE: 50,
  QUERY_SEPARATOR: '?',
  EMPTY: '',
  NOT_A_UUID: 'not-a-uuid',
  IDS_UP_TO_SQL: 'SELECT id FROM audit_log WHERE (created_at, id) <= ($1::timestamptz, $2::uuid) ORDER BY created_at DESC, id DESC'
} as const;
