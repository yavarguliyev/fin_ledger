import * as argon2 from 'argon2';

import { AUTH_CONSTANTS } from '../auth/auth.constant';

export const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: AUTH_CONSTANTS.ARGON2_MEMORY_COST,
  timeCost: AUTH_CONSTANTS.ARGON2_TIME_COST,
  parallelism: AUTH_CONSTANTS.ARGON2_PARALLELISM
} as const;
