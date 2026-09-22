export const MFA_RECOVERY_CODE_CONSTANTS = {
  RETIRE_UNUSED_SQL: 'UPDATE mfa_recovery_codes SET used_at = now() WHERE user_id = $1 AND used_at IS NULL',
  INSERT_SQL: 'INSERT INTO mfa_recovery_codes (user_id, code_hash) SELECT $1, unnest($2::text[])',
  CLAIM_SQL: 'UPDATE mfa_recovery_codes SET used_at = now() WHERE user_id = $1 AND code_hash = $2 AND used_at IS NULL RETURNING id'
} as const;
