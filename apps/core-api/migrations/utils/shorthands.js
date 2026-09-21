import { PgLiteral } from 'node-pg-migrate';

/**
 * Shared column shorthands.
 *
 * Previously every migration re-declared its own `shorthands` export, which meant
 * `money` was `bigint NOT NULL DEFAULT 0` in one file and absent in the next, and a
 * change to `id` had to be made in eleven places. Import from here instead.
 *
 * The constrained money types are DOMAINs (created in migration 001), not inline
 * column CHECKs, because an inline CHECK in a shorthand cannot reference the column
 * it is attached to -- a domain validates every use of the type automatically.
 */
export const shorthands = {
  // UUIDv7: time-sortable, so B-tree inserts stay at the right edge of the index
  // instead of scattering random pages the way UUIDv4 does.
  id: {
    type: 'uuid',
    primaryKey: true,
    default: new PgLiteral('uuid_generate_v7()')
  },

  created_at: {
    type: 'timestamptz',
    notNull: true,
    default: new PgLiteral('CURRENT_TIMESTAMP')
  },

  updated_at: {
    type: 'timestamptz',
    notNull: true,
    default: new PgLiteral('CURRENT_TIMESTAMP')
  },

  // ISO-4217 code, validated by domain. NOT char(3) -- see migration 001.
  currency: { type: 'currency_code', notNull: true },

  // Signed minor units. Deliberately has NO default: a zero-value money column is
  // usually a bug that DEFAULT 0 hides until reconciliation day.
  money: { type: 'money_minor', notNull: true },
  money_nonneg: { type: 'money_minor_nonneg', notNull: true },
  money_positive: { type: 'money_minor_positive', notNull: true },

  fk_user: {
    type: 'uuid',
    notNull: true,
    references: 'users(id)',
    onDelete: 'RESTRICT'
  },

  idempotency_key: { type: 'varchar(255)', notNull: true }
};

export default shorthands;
