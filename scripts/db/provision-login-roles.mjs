import pg from 'pg';

const GROUP_ROLE = 'app_readwrite';
const WORKER_GROUP_ROLE = 'app_worker_group';
const { DATABASE_URL } = process.env;
const APP_API_ROLE = process.env.APP_API_DB_USERNAME ?? process.env.DB_USERNAME;
const APP_API_DB_PASSWORD = process.env.APP_API_DB_PASSWORD ?? process.env.DB_PASSWORD;
const APP_WORKER_ROLE = process.env.APP_WORKER_DB_USERNAME;
const APP_WORKER_DB_PASSWORD = process.env.APP_WORKER_DB_PASSWORD;

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

const provision = async ({ name, secret, bypassRls, groupRole }) => {
  const role = client.escapeIdentifier(name);
  const password = client.escapeLiteral(secret);
  const { rowCount } = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [name]);

  await client.query(
    `${rowCount ? 'ALTER' : 'CREATE'} ROLE ${role} LOGIN PASSWORD ${password} NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT ${bypassRls ? 'BYPASSRLS' : 'NOBYPASSRLS'}`
  );
  await client.query(`GRANT ${client.escapeIdentifier(groupRole)} TO ${role}`);

  console.log(`${rowCount ? 'Updated' : 'Created'} login role ${name} (member of ${groupRole}, ${bypassRls ? 'BYPASSRLS' : 'row-level security enforced'})`);
};

await provision({ name: APP_API_ROLE, secret: APP_API_DB_PASSWORD, bypassRls: false, groupRole: GROUP_ROLE });

if (APP_WORKER_ROLE && APP_WORKER_DB_PASSWORD) {
  await provision({ name: APP_WORKER_ROLE, secret: APP_WORKER_DB_PASSWORD, bypassRls: true, groupRole: WORKER_GROUP_ROLE });
} else {
  console.warn('APP_WORKER_DB_USERNAME / APP_WORKER_DB_PASSWORD not set: background work will run as the API role and row-level security will block it.');
}

await client.end();
