import { BetStatus, PaymentStatus } from '@common/libs';

export const USER_CONSTANTS = {
  ANONYMIZED_EMAIL_DOMAIN: 'anonymized.invalid',
  ANONYMIZED_DISPLAY_NAME: 'Deleted user',
  OPEN_PAYMENT_STATUSES: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.REQUIRES_ACTION],
  OPEN_BET_STATUSES: [BetStatus.PENDING],
  RETAINED_RECORDS_QUERY: `
    SELECT EXISTS (SELECT 1 FROM wallets WHERE user_id = $1)
        OR EXISTS (SELECT 1 FROM ledger_accounts WHERE user_id = $1)
        OR EXISTS (SELECT 1 FROM payment_methods WHERE user_id = $1)
        OR EXISTS (SELECT 1 FROM payments WHERE user_id = $1)
        OR EXISTS (SELECT 1 FROM bets WHERE user_id = $1)
        OR EXISTS (SELECT 1 FROM ledger_transactions WHERE actor_user_id = $1)
        OR EXISTS (SELECT 1 FROM audit_log WHERE actor_user_id = $1) AS retained
  `,
  ANONYMIZATION_BLOCKERS_QUERY: `
    SELECT
      (SELECT COALESCE(SUM(available_balance_minor + reserved_balance_minor), 0) FROM wallets WHERE user_id = $1) AS "balanceMinor",
      (SELECT COUNT(*) FROM payments WHERE user_id = $1 AND status::text = ANY($2)) AS "openPayments",
      (SELECT COUNT(*) FROM bets WHERE user_id = $1 AND status::text = ANY($3)) AS "openBets"
  `,
  ANONYMIZE_USER_SQL: `
    UPDATE users
       SET email = $2, display_name = $3, password_hash = NULL, password_changed_at = NULL,
           profile_images = '[]'::jsonb, profile_images_key = NULL, profile_image_index = 0,
           is_email_verified = false, email_verified_at = NULL, status = 'CLOSED',
           deleted_at = COALESCE(deleted_at, now())
     WHERE id = $1
  `,
  CLOSE_USER_WALLETS_SQL: "UPDATE wallets SET status = 'CLOSED' WHERE user_id = $1 AND status <> 'CLOSED'",
  REMOVE_USER_PAYMENT_METHODS_SQL: `
    UPDATE payment_methods
       SET status = 'REMOVED', verified_at = NULL, is_default = false, account_holder = $2, metadata = NULL,
           deleted_at = COALESCE(deleted_at, now())
     WHERE user_id = $1
  `,
  DELETE_USER_NOTIFICATIONS_SQL: 'DELETE FROM notifications WHERE user_id = $1'
} as const;
