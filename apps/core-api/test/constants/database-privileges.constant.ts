export const DATABASE_PRIVILEGES_TEST = {
  INSUFFICIENT_PRIVILEGE: '42501',
  ALLOWED: 'allowed',
  API_LOGIN: 'app_api',
  WARM_UP_PATH: '/game-events',
  SESSIONS_SQL:
    "SELECT DISTINCT usename FROM pg_stat_activity WHERE datname = current_database() AND backend_type = 'client backend' AND pid <> pg_backend_pid()",
  CURRENT_USER_SQL: 'SELECT current_user AS name',
  SCHEMA_CHANGES: [
    'DROP TABLE payments',
    'ALTER TABLE payments ADD COLUMN injected text',
    'TRUNCATE ledger_entries',
    'CREATE TABLE injected (id int)'
  ],
  DENIED_DELETES: ['DELETE FROM payments WHERE false', 'DELETE FROM ledger_entries WHERE false', 'DELETE FROM wallets WHERE false'],
  ALLOWED_DELETES: ['DELETE FROM notifications WHERE false', 'DELETE FROM users WHERE false'],
  GET: 'GET'
} as const;
