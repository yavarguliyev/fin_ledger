import { AuthTokenPurpose } from '@common/libs';

export const AUTH_TOKEN_CONSTANTS = {
  TOKEN_BYTES: 32,
  MAX_FAILED_ATTEMPTS: 5,
  TTL_SECONDS: {
    [AuthTokenPurpose.ACCOUNT_INVITE]: 86_400,
    [AuthTokenPurpose.EMAIL_VERIFICATION]: 86_400,
    [AuthTokenPurpose.MFA_CHALLENGE]: 300,
    [AuthTokenPurpose.PASSWORD_RESET]: 900
  } satisfies Record<AuthTokenPurpose, number>,
  REVOKE_ACTIVE_SQL: 'UPDATE auth_tokens SET revoked_at = now() WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL AND revoked_at IS NULL',
  INSERT_SQL: 'INSERT INTO auth_tokens (user_id, purpose, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
  FIND_ACTIVE_SQL: `
    SELECT user_id AS "userId", purpose
      FROM auth_tokens
     WHERE token_hash = $1
       AND purpose = ANY($2)
       AND used_at IS NULL
       AND revoked_at IS NULL
       AND expires_at > now()
  `,
  RECORD_FAILURE_SQL: `
    UPDATE auth_tokens
       SET failed_attempts = failed_attempts + 1,
           revoked_at = CASE WHEN failed_attempts + 1 >= $2 THEN now() ELSE revoked_at END
     WHERE token_hash = $1
       AND used_at IS NULL
       AND revoked_at IS NULL
  `,
  CLAIM_SQL: `
    UPDATE auth_tokens
       SET used_at = now()
     WHERE token_hash = $1
       AND purpose = ANY($2)
       AND used_at IS NULL
       AND revoked_at IS NULL
       AND expires_at > now()
    RETURNING user_id AS "userId", purpose
  `
} as const;
