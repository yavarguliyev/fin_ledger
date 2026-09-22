/**
 * Creates or updates the API's database login, using the owner connection (DATABASE_URL).
 * Login roles and passwords are environment-specific, so they live here and not in migrations.
 *
 *   DATABASE_URL=postgres://owner@host/db DB_USERNAME=app_api DB_PASSWORD=... node scripts/db/provision-login-roles.mjs
 *
 * It reads the same DB_USERNAME / DB_PASSWORD the API connects with (APP_API_DB_USERNAME / APP_API_DB_PASSWORD override them).
 *
 * The login is a member of app_readwrite (created by migration 013): no table ownership, no DDL, no TRUNCATE,
 * DELETE only where granted. BYPASSRLS stays until row-level security is enforced per request (API-P0-5 step 2).
 */
import pg from 'pg';

const GROUP_ROLE = 'app_readwrite';
const { DATABASE_URL } = process.env;
const APP_API_ROLE = process.env.APP_API_DB_USERNAME ?? process.env.DB_USERNAME;
const APP_API_DB_PASSWORD = process.env.APP_API_DB_PASSWORD ?? process.env.DB_PASSWORD;

if (!DATABASE_URL || !APP_API_ROLE || !APP_API_DB_PASSWORD) {
  console.error('DATABASE_URL (owner connection), DB_USERNAME and DB_PASSWORD are required.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });
await client.connect();

const { rows: [owner] } = await client.query('SELECT current_user AS name');
if (owner.name === APP_API_ROLE) {
  console.error(`DB_USERNAME is the owner role (${APP_API_ROLE}); set it to the API login, e.g. app_api.`);
  await client.end();
  process.exit(1);
}

const role = client.escapeIdentifier(APP_API_ROLE);
const password = client.escapeLiteral(APP_API_DB_PASSWORD);
const { rowCount } = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [APP_API_ROLE]);

await client.query(`${rowCount ? 'ALTER' : 'CREATE'} ROLE ${role} LOGIN PASSWORD ${password} NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT BYPASSRLS`);
await client.query(`GRANT ${client.escapeIdentifier(GROUP_ROLE)} TO ${role}`);
await client.end();

console.log(`${rowCount ? 'Updated' : 'Created'} login role ${APP_API_ROLE} (member of ${GROUP_ROLE})`);
