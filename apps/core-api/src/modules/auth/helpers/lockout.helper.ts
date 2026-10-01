import { LOCKOUT } from '../constants/lockout/lockout.constant';
import { LockoutStateDto } from '../dtos/lockout/lockout-state.dto';
import { LockoutUpdateDto } from '../dtos/lockout/lockout-update.dto';

export class LockoutHelper {
  static isLocked ({ lockedUntil }: LockoutStateDto): boolean {
    return !!lockedUntil && new Date(lockedUntil).getTime() > Date.now();
  }

  static cleared (): LockoutUpdateDto {
    return { failedLoginAttempts: LOCKOUT.RESET_ATTEMPTS, lockedUntil: null };
  }

  static afterFailure ({ failedLoginAttempts = 0 }: LockoutStateDto): LockoutUpdateDto {
    const attempts = failedLoginAttempts + LOCKOUT.FIRST_FAILURE;
    if (attempts < LOCKOUT.MAX_ATTEMPTS) return { failedLoginAttempts: attempts, lockedUntil: null };
    const lockedUntil = new Date(Date.now() + LOCKOUT.LOCK_MINUTES * LOCKOUT.MS_PER_MINUTE).toISOString();
    return { failedLoginAttempts: attempts, lockedUntil };
  }
}
