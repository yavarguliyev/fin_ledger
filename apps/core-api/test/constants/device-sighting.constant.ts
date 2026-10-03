import { HTTP_STATUS } from './http-status.constant';
import { TEST_USERS } from './test-users.constant';

export const DEVICE_SIGHTING = {
  ...HTTP_STATUS,
  LOGIN_PATH: '/auth/login',
  EMAIL: `device-atomic${TEST_USERS.DOMAIN}`,
  FAILING_DEVICE: 'integration-device-atomic',
  NEW_DEVICE_EVENT: 'email.user.new-device',
  DEVICES_SQL: 'SELECT count(*)::int AS count FROM user_devices WHERE user_id = $1',
  LOGIN_EVENTS_SQL: 'SELECT count(*)::int AS count FROM login_events WHERE user_id = $1',
  OUTBOX_SQL: 'SELECT count(*)::int AS count FROM outbox_events WHERE aggregate_id::text = $1 AND event_type = $2',
  CREATE_FUNCTION_SQL: `CREATE OR REPLACE FUNCTION test_fail_new_device_event() RETURNS trigger AS $$
    BEGIN IF NEW.event_type = 'email.user.new-device' THEN RAISE EXCEPTION 'simulated outbox failure'; END IF; RETURN NEW; END $$ LANGUAGE plpgsql`,
  CREATE_TRIGGER_SQL: 'CREATE TRIGGER test_fail_new_device_event BEFORE INSERT ON outbox_events FOR EACH ROW EXECUTE FUNCTION test_fail_new_device_event()',
  DROP_TRIGGER_SQL: 'DROP TRIGGER IF EXISTS test_fail_new_device_event ON outbox_events',
  DROP_FUNCTION_SQL: 'DROP FUNCTION IF EXISTS test_fail_new_device_event()'
} as const;
