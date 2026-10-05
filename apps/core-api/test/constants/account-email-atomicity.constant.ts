import { HTTP_STATUS } from './http-status.constant';
import { TEST_USERS } from './test-users.constant';

export const ACCOUNT_EMAIL_ATOMICITY = {
  ...HTTP_STATUS,
  ENABLE_EMAIL: `atomic-mfa-on${TEST_USERS.DOMAIN}`,
  DISABLE_EMAIL: `atomic-mfa-off${TEST_USERS.DOMAIN}`,
  CHANGE_EMAIL: `atomic-email-old${TEST_USERS.DOMAIN}`,
  NEW_EMAIL: `atomic-email-new${TEST_USERS.DOMAIN}`,
  MFA_ENABLED_EVENT: 'email.user.mfa-enabled',
  MFA_DISABLED_EVENT: 'email.user.mfa-disabled',
  EMAIL_CHANGED_EVENT: 'email.user.email-changed-notice',
  ENABLE_PATH: '/auth/mfa/enable',
  CHANGE_EMAIL_PATH: '/auth/change-email',
  CONFIRM_EMAIL_CHANGE_PATH: '/auth/confirm-email-change',
  TOKEN_PARAM: 'token',
  MFA_ENABLED_SQL: 'SELECT mfa_enabled_at IS NOT NULL AS enabled FROM users WHERE id = $1',
  EMAILS_SQL: 'SELECT email, pending_email FROM users WHERE id = $1',
  OUTBOX_SQL: 'SELECT count(*)::int AS count FROM outbox_events WHERE aggregate_id::text = $1 AND event_type = $2',
  CREATE_FUNCTION_SQL: `CREATE OR REPLACE FUNCTION test_fail_account_email() RETURNS trigger AS $$
    BEGIN
      IF NEW.event_type IN ('email.user.mfa-enabled', 'email.user.mfa-disabled', 'email.user.email-changed-notice')
      THEN RAISE EXCEPTION 'simulated outbox failure'; END IF;
      RETURN NEW;
    END $$ LANGUAGE plpgsql`,
  CREATE_TRIGGER_SQL: 'CREATE TRIGGER test_fail_account_email BEFORE INSERT ON outbox_events FOR EACH ROW EXECUTE FUNCTION test_fail_account_email()',
  DROP_TRIGGER_SQL: 'DROP TRIGGER IF EXISTS test_fail_account_email ON outbox_events',
  DROP_FUNCTION_SQL: 'DROP FUNCTION IF EXISTS test_fail_account_email()'
} as const;
