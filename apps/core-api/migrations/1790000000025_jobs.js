export { shorthands } from './utils/shorthands.js';

const STATUSES = ['PENDING', 'RUNNING', 'DONE', 'DEAD'];
const TABLE = 'jobs';

export const up = pgm => {
  pgm.createTable(TABLE, {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    payload: { type: 'jsonb', notNull: true, default: '{}', check: "jsonb_typeof(payload) = 'object'" },
    status: { type: 'text', notNull: true, default: 'PENDING' },
    run_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    attempts: { type: 'smallint', notNull: true, default: 0, check: 'attempts >= 0' },
    max_attempts: { type: 'smallint', notNull: true, default: 5, check: 'max_attempts > 0' },
    dedupe_key: { type: 'varchar(200)' },
    last_error: { type: 'text' },
    locked_at: { type: 'timestamptz' },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.addConstraint(TABLE, 'chk_jobs_status', { check: `status IN (${STATUSES.map(status => `'${status}'`).join(', ')})` });
  pgm.createIndex(TABLE, 'dedupe_key', {
    name: 'uq_jobs_dedupe_open',
    unique: true,
    where: "dedupe_key IS NOT NULL AND status IN ('PENDING', 'RUNNING')"
  });
  pgm.createIndex(TABLE, ['status', 'run_at'], { name: 'idx_jobs_claimable', where: "status = 'PENDING'" });

  pgm.sql(`
    GRANT SELECT, INSERT, UPDATE, DELETE ON ${TABLE} TO app_readwrite;
    GRANT SELECT ON ${TABLE} TO app_readonly;
  `);
};

export const down = pgm => {
  pgm.dropTable(TABLE);
};
