export { shorthands } from './utils/shorthands.js';

const ADDRESSES = 'user_addresses';
const SOURCES = ['MANUAL', 'MAP', 'CURRENT_LOCATION'];
const ADMIN_ROLES = ['GLOBAL_ADMIN', 'ADMIN'];
const ERASE_FUNCTION = 'erase_user_address';

const quoted = values => values.map(value => `'${value}'`).join(', ');

export const up = pgm => {
  pgm.createTable(ADDRESSES, {
    user_id: { type: 'uuid', primaryKey: true, references: 'users(id)', onDelete: 'CASCADE' },
    line1: { type: 'varchar(200)', notNull: true },
    line2: { type: 'varchar(200)' },
    city: { type: 'varchar(120)', notNull: true },
    region: { type: 'varchar(120)' },
    postal_code: { type: 'varchar(20)' },
    country_code: { type: 'char(2)', notNull: true },
    latitude: { type: 'numeric(9,6)', check: 'latitude IS NULL OR latitude BETWEEN -90 AND 90' },
    longitude: { type: 'numeric(9,6)', check: 'longitude IS NULL OR longitude BETWEEN -180 AND 180' },
    source: { type: 'text', notNull: true, default: 'MANUAL' },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.addConstraint(ADDRESSES, 'chk_user_addresses_source', { check: `source IN (${quoted(SOURCES)})` });

  pgm.sql(`
    GRANT SELECT, INSERT, UPDATE, DELETE ON ${ADDRESSES} TO app_readwrite;
    ALTER TABLE ${ADDRESSES} ENABLE ROW LEVEL SECURITY;
    CREATE POLICY ${ADDRESSES}_owner_access ON ${ADDRESSES}
      FOR ALL TO app_readwrite
      USING (user_id = app_current_user_id())
      WITH CHECK (user_id = app_current_user_id());

    CREATE OR REPLACE FUNCTION ${ERASE_FUNCTION}(target uuid)
    RETURNS void
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = pg_catalog, public
    AS $$
      DELETE FROM ${ADDRESSES} WHERE user_id = target AND app_current_role() IN (${quoted(ADMIN_ROLES)});
    $$;

    REVOKE ALL ON FUNCTION ${ERASE_FUNCTION}(uuid) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION ${ERASE_FUNCTION}(uuid) TO app_readwrite;
  `);
};

export const down = pgm => {
  pgm.sql(`DROP FUNCTION IF EXISTS ${ERASE_FUNCTION}(uuid);`);
  pgm.sql(`DROP POLICY IF EXISTS ${ADDRESSES}_owner_access ON ${ADDRESSES};`);
  pgm.dropTable(ADDRESSES);
};
