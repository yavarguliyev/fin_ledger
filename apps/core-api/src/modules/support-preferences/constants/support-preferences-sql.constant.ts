const PROJECTION = `
  coalesce(muted_until > now(), false) AS "muted",
  CASE WHEN muted_until > now() AND isfinite(muted_until)
       THEN to_char(muted_until AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END AS "mutedUntil",
  to_char(pinned_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "pinnedAt",
  favourite
`;

const upsert = (column: string, value: string): string => `
  INSERT INTO support_conversation_preferences AS pref (conversation_id, user_id, ${column})
  VALUES ($1, $2, ${value})
  ON CONFLICT (conversation_id, user_id) DO UPDATE SET ${column} = EXCLUDED.${column}, updated_at = now()
  RETURNING ${PROJECTION}
`;

export const SUPPORT_PREFERENCES_SQL = {
  MUTE: upsert(
    'muted_until',
    `CASE WHEN $3::int IS NULL THEN 'infinity'::timestamptz WHEN $3::int = 0 THEN NULL ELSE now() + make_interval(secs => $3::int) END`
  ),
  PIN: upsert('pinned_at', 'CASE WHEN $3::boolean THEN now() END'),
  FAVOURITE: upsert('favourite', '$3::boolean'),
  SET_THEME: 'UPDATE support_conversations SET theme = $2, updated_at = now() WHERE id = $1 RETURNING theme',
  OTHER_PINS: `
    SELECT count(*)::int AS "count"
      FROM support_conversation_preferences
     WHERE user_id = $2 AND conversation_id <> $1 AND pinned_at IS NOT NULL
  `
} as const;
