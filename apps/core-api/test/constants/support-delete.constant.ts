export const SUPPORT_DELETE_TEST = {
  CUSTOMER_EMAIL: 'delete-customer@support-tests.realtime-wallet-payments.com',
  KEEP_TEXT: 'Please keep this one',
  GONE_TEXT: 'Sent this by mistake',
  OLD_TEXT: 'Something I said a while ago',
  ME: 'ME',
  EVERYONE: 'EVERYONE',
  BACKDATE_SQL: "UPDATE support_messages SET created_at = now() - $2::interval WHERE id = $1",
  PAST_EDIT_WINDOW: '16 minutes',
  PAST_DELETE_WINDOW: '49 hours',
  OK: 200,
  BAD_REQUEST: 400,
  FORBIDDEN: 403
} as const;
