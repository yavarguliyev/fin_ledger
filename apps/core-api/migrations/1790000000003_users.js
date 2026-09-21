export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'email_address', notNull: true },
    display_name: { type: 'varchar(100)', notNull: true, check: 'length(btrim(display_name)) > 0' },

    password_hash: { type: 'varchar(255)' },
    password_algo: { type: 'varchar(20)', notNull: true, default: 'argon2id' },
    password_changed_at: { type: 'timestamptz' },

    role: { type: 'user_role', notNull: true, default: 'USER' },
    status: { type: 'user_status', notNull: true, default: 'PENDING' },

    failed_login_attempts: { type: 'smallint', notNull: true, default: 0, check: 'failed_login_attempts >= 0' },
    locked_until: { type: 'timestamptz' },
    last_login_at: { type: 'timestamptz' },
    last_login_ip: { type: 'inet' },

    mfa_secret_encrypted: { type: 'bytea' },
    mfa_enabled_at: { type: 'timestamptz' },

    is_email_verified: { type: 'boolean', notNull: true, default: false },
    email_verified_at: { type: 'timestamptz' },

    terms_accepted_at: { type: 'timestamptz' },
    date_of_birth: { type: 'date' },
    country_code: { type: 'char(2)', check: "country_code ~ '^[A-Z]{2}$'" },

    kyc_status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'NOT_STARTED',
      check: "kyc_status IN ('NOT_STARTED','PENDING','APPROVED','REJECTED')"
    },

    self_exclusion_until: { type: 'timestamptz' },

    profile_images_key: { type: 'varchar(255)' },
    profile_images: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb"), check: "jsonb_typeof(profile_images) = 'array'" },
    profile_image_index: { type: 'integer', notNull: true, default: 0, check: 'profile_image_index >= 0' },

    deleted_at: { type: 'timestamptz' },
    version: { type: 'integer', notNull: true, default: 0 },
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  pgm.createIndex('users', 'email', { name: 'uq_users_email_active', unique: true, where: 'deleted_at IS NULL' });
  pgm.createIndex('users', ['status', 'created_at'], { name: 'idx_users_status_created' });
  pgm.createIndex('users', 'created_at', { name: 'idx_users_created_at_brin', method: 'brin' });
  pgm.createIndex('users', 'deleted_at', { name: 'idx_users_deleted_at', where: 'deleted_at IS NOT NULL' });
  pgm.createIndex('users', 'profile_images_key', { name: 'idx_users_profile_images_key', where: 'profile_images_key IS NOT NULL' });

  pgm.addConstraint('users', 'chk_users_password_changed_at', { check: '(password_hash IS NULL) = (password_changed_at IS NULL)' });

  pgm.addConstraint('users', 'chk_users_email_verified_consistency', {
    check: '(is_email_verified = false AND email_verified_at IS NULL) OR (is_email_verified = true AND email_verified_at IS NOT NULL)'
  });

  pgm.addConstraint('users', 'chk_users_dob_sane', {
    check: "date_of_birth IS NULL OR (date_of_birth > DATE '1900-01-01' AND date_of_birth < CURRENT_DATE)"
  });
};

export const down = pgm => {
  pgm.dropTable('users');
};
