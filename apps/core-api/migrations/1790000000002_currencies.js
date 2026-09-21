export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createTable('currencies', {
    code: { type: 'currency_code', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    minor_unit: {
      type: 'smallint',
      notNull: true,
      check: 'minor_unit BETWEEN 0 AND 4'
    },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.sql(`
    INSERT INTO currencies (code, name, minor_unit) VALUES
      ('USD', 'United States Dollar', 2),
      ('EUR', 'Euro', 2),
      ('GBP', 'Pound Sterling', 2),
      ('AZN', 'Azerbaijani Manat', 2),
      ('TRY', 'Turkish Lira', 2),
      ('JPY', 'Japanese Yen', 0),
      ('KWD', 'Kuwaiti Dinar', 3)
    ON CONFLICT (code) DO NOTHING;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION format_minor(p_amount bigint, p_currency currency_code)
    RETURNS numeric
    LANGUAGE sql
    STABLE
    PARALLEL SAFE
    SET search_path = pg_catalog, public
    AS $$
      SELECT p_amount::numeric / (10::numeric ^ c.minor_unit)
      FROM currencies c
      WHERE c.code = p_currency;
    $$;
  `);
};

export const down = pgm => {
  pgm.sql('DROP FUNCTION IF EXISTS format_minor(bigint, currency_code);');
  pgm.dropTable('currencies');
};
