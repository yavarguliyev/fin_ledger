import { AuthTokenPurpose } from '@common/libs';

export const AUTH_TOKEN_CONSTANTS = {
  TOKEN_BYTES: 32,
  MAX_FAILED_ATTEMPTS: 5,
  TTL_SECONDS: {
    [AuthTokenPurpose.ACCOUNT_INVITE]: 86_400,
    [AuthTokenPurpose.EMAIL_VERIFICATION]: 86_400,
    [AuthTokenPurpose.MFA_CHALLENGE]: 300,
    [AuthTokenPurpose.PASSWORD_RESET]: 900
  } satisfies Record<AuthTokenPurpose, number>
} as const;
