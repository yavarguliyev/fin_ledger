import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { SessionData } from '../interfaces/session.interface';
import { AUTH_CONSTANTS } from '../constants/auth.constant';
import { CompareParams, GetSessionUserParams, HashParams, ParseExpiryToSecondsParams } from '../dto/session.dto';

export class SessionHelper {
  public static async hash ({ password }: HashParams): Promise<string> {
    return bcrypt.hash(password, AUTH_CONSTANTS.BCRYPT_ROUNDS);
  }

  public static async compare ({ password, passwordHash }: CompareParams): Promise<void> {
    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
  }

  public static getSessionUser ({ context }: GetSessionUserParams): SessionData {
    if (!context.user) throw new UnauthorizedException('User not authenticated');
    return context.user;
  }

  public static parseExpiryToSeconds ({ expiry }: ParseExpiryToSecondsParams): number {
    const match = expiry.match(/^(\d+)([smhd])$/);

    if (match && match[1] && match[2]) {
      const value = match[1];
      const unit = match[2];
      const num = parseInt(value, 10);

      const multipliers: Record<string, number> = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400
      };

      const multiplier = multipliers[unit];
      return multiplier ? num * multiplier : 604800;
    }

    const parsed = parseInt(expiry, 10);
    if (!isNaN(parsed) && expiry === parsed.toString()) return parsed;
    return 604800;
  }
}
