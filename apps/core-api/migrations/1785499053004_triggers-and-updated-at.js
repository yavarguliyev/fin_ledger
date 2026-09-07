export const up = pgm => {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  const tables = ['users', 'ledger_accounts', 'wallets', 'payment_methods', 'payments', 'notifications', 'game_events'];

  tables.forEach(table => {
    pgm.sql(`
      CREATE TRIGGER update_${table}_updated_at
      BEFORE UPDATE ON ${table}
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
    `);
  });
};

export const down = pgm => {
  const tables = ['users', 'ledger_accounts', 'wallets', 'payment_methods', 'payments', 'notifications', 'game_events'];

  tables.forEach(table => {
    pgm.sql(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};`);
  });

  pgm.sql(`DROP FUNCTION IF EXISTS update_updated_at_column();`);
};
