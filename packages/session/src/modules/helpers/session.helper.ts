import { UnauthorizedException } from '@nestjs/common';
import { CryptoHelper } from '@common/shared-libs';

import { SessionData } from '../interfaces/session-data.interface';
import { PasswordHelper } from './password.helper';
import { HashDto } from '../dtos/helper/hash.dto';
import { CompareDto } from '../dtos/helper/compare.dto';
import { GetSessionUserDto } from '../dtos/helper/get-session-user.dto';
import { ParseExpiryDto } from '../dtos/helper/parse-expiry.dto';

export class SessionHelper {
  private static dummyPasswordHash: Promise<string> | null = null;

  static async hash ({ password }: HashDto): Promise<string> {
    return PasswordHelper.hash({ password });
  }

  static async compare (dto: CompareDto): Promise<void> {
    const isMatch = await SessionHelper.matches(dto);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
  }

  static getSessionUser ({ context }: GetSessionUserDto): SessionData {
    if (!context.user) throw new UnauthorizedException('User not authenticated');
    return context.user;
  }

  static async rejectWithDummyHash ({ password }: HashDto): Promise<never> {
    SessionHelper.dummyPasswordHash ??= SessionHelper.hash({ password: CryptoHelper.uuid() });
    await SessionHelper.matches({ password, passwordHash: await SessionHelper.dummyPasswordHash });
    throw new UnauthorizedException('Invalid credentials');
  }

  static async matches (dto: CompareDto): Promise<boolean> {
    return PasswordHelper.matches(dto);
  }

  static parseExpiryToSeconds ({ expiry }: ParseExpiryDto): number {
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
