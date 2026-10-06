export const SUPPORT_CONTACT_SQL = {
  TABLE: 'users',
  CUSTOMER_CARD: `
    SELECT false AS "isStaff", id AS "userId", display_name AS name, role::text AS role, created_at AS "memberSince",
           status::text AS "accountStatus", kyc_status::text AS "kycStatus"
      FROM users
     WHERE id = $1
  `,
  NAME: 'SELECT display_name AS name FROM users WHERE id = $1',
  LIST_STAFF: `
    SELECT id AS "userId", display_name AS "displayName", role
      FROM users
     WHERE role = ANY($1::text[]) AND status = 'ACTIVE' AND deleted_at IS NULL AND id <> $2
     ORDER BY array_position($1::text[], role), display_name
  `,
  FIND_STAFF: `
    SELECT id AS "userId", display_name AS "displayName", role
      FROM users
     WHERE id = $1 AND role = ANY($2::text[]) AND status = 'ACTIVE' AND deleted_at IS NULL
  `
} as const;
