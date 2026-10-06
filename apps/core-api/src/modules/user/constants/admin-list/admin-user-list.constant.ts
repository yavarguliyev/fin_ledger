export const ADMIN_USER_LIST = {
  PAGE_SQL: `
    WITH page AS (
      SELECT id
        FROM users
       WHERE role = $1
         AND ($2::timestamptz IS NULL OR (created_at, id) < ($2::timestamptz, $3::uuid))
       ORDER BY created_at DESC, id DESC
       LIMIT $4
    )
    SELECT u.id, u.email, u.display_name, u.role, u.status AS user_status, w.id AS wallet_id,
           u.is_email_verified, u.deleted_at,
           to_char(u.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at,
           w.available_balance_minor::float8 AS available_balance_minor,
           w.reserved_balance_minor::float8 AS reserved_balance_minor,
           w.currency, w.status
      FROM page
      JOIN users u ON u.id = page.id
      LEFT JOIN wallets w ON w.user_id = u.id
     ORDER BY u.created_at DESC, u.id DESC, w.currency
  `,
  TOTALS_SQL: `
    SELECT (SELECT COUNT(*) FROM users WHERE role = $1)::int AS "totalUsers",
           (SELECT COUNT(*) FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.role = $1 AND w.status = $2)::int AS "activeWallets"
  `,
  VOLUMES_SQL: `
    SELECT w.currency, SUM(w.available_balance_minor + w.reserved_balance_minor)::float8 AS "amountMinor"
      FROM wallets w
      JOIN users u ON u.id = w.user_id
     WHERE u.role = $1
     GROUP BY w.currency
     ORDER BY w.currency
  `
} as const;
