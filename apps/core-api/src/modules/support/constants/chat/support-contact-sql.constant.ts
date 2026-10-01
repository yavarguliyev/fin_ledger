export const SUPPORT_CONTACT_SQL = {
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
