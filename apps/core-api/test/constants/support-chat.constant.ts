import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_CHAT_TEST = {
  ...HTTP_STATUS,
  CUSTOMER_EMAIL: 'chat-customer@support-tests.realtime-wallet-payments.com',
  OTHER_EMAIL: 'chat-other@support-tests.realtime-wallet-payments.com',
  STAFF_EMAIL: 'moderator@realtime-wallet-payments.com',
  ADMIN_EMAIL: 'admin@realtime-wallet-payments.com',
  USER_ID_SQL: 'SELECT id FROM users WHERE email = $1',
  CONTACTS_PATH: '/support/contacts',
  LOGOUT_PATH: '/auth/logout',
  STAFF_ROLES: ['GLOBAL_ADMIN', 'ADMIN', 'MODERATOR'] as readonly string[],
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  CONVERSATIONS_PATH: '/support/conversations',
  SUBJECT: 'My deposit did not arrive',
  CUSTOMER_TEXT: 'Hello, my deposit is missing',
  STAFF_TEXT: 'Checking that for you now',
  OTHER_TEXT: 'let me read your thread',
  STAFF_ROLE: 'MODERATOR',
  CLEAN_SQL: 'DELETE FROM support_conversations WHERE customer_user_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))',
  ASSIGNED_SQL: 'SELECT assigned_staff_id AS "assignedStaffId" FROM support_conversations WHERE id = $1',
  STAFF_REPLY: 'Looking into it right now',
  STREAM_TICKET_PATH: '/support/stream-ticket',
  STREAM_PATH: '/support/stream?ticket=',
  TYPING_EVENT: 'support.conversation.typing',
  STREAM_WAIT_MS: 5000
} as const;
