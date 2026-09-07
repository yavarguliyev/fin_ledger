import { PgLiteral } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'uuid', primaryKey: true, default: new PgLiteral('uuid_generate_v7()') },
  created_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  updated_at: { type: 'timestamptz', notNull: true, default: new PgLiteral('CURRENT_TIMESTAMP') },
  email: { type: 'varchar(255)', notNull: true, unique: true },
  varchar_100: { type: 'varchar(100)', notNull: true },
  varchar_255: { type: 'varchar(255)', notNull: true },
  role: {
    type: 'varchar(50)',
    notNull: true,
    default: 'user',
    check: "role IN ('global admin', 'admin', 'moderator', 'user')"
  }
};

export const up = pgm => {
  pgm.createTable('users', {
    id: 'id',
    email: 'email',
    display_name: 'varchar_100',
    password_hash: 'varchar_255',
    role: 'role',
    profile_images_key: {
      type: 'varchar(255)',
      notNull: false
    },
    profile_images: {
      type: 'jsonb',
      default: pgm.func("'[]'::jsonb"),
      notNull: true
    },
    profile_image_index: { type: 'integer', default: 0 },
    wallet_id: { type: 'uuid' },
    ledger_account_id: { type: 'uuid' },
    last_login: {
      type: 'timestamptz',
      notNull: false
    },
    is_email_verified: {
      type: 'boolean',
      notNull: true,
      default: false
    },
    deleted_at: {
      type: 'timestamptz',
      notNull: false
    },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.createIndex('users', 'profile_images_key');
  pgm.createIndex('users', 'profile_images', { method: 'gin' });
  pgm.createIndex('users', 'deleted_at', {
    name: 'idx_users_deleted_at',
    where: 'deleted_at IS NOT NULL'
  });
  pgm.createIndex('users', 'is_email_verified', {
    name: 'idx_users_is_email_verified'
  });
};

export const down = pgm => {
  pgm.dropTable('users', { cascade: true });
};
