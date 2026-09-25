import { UnauthorizedException } from '@nestjs/common';
import { CryptoHelper } from '@common/shared-libs';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcryptjs';

import { SessionData } from '../interfaces/session-data.interface';
import { ARGON2_OPTIONS } from '../constants/password/argon2-options.constant';
import { HashDto } from '../dtos/helper/hash.dto';
import { CompareDto } from '../dtos/helper/compare.dto';
import { PasswordHashDto } from '../dtos/helper/password-hash.dto';
import { GetSessionUserDto } from '../dtos/helper/get-session-user.dto';
import { ParseExpiryDto } from '../dtos/helper/parse-expiry.dto';

export class SessionHelper {
  private static dummyPasswordHash: Promise<string> | null = null;

  static async hash ({ password }: HashDto): Promise<string> {
    return argon2.hash(password, ARGON2_OPTIONS);
  }

  static isLegacyHash ({ passwordHash }: PasswordHashDto): boolean {
    return !passwordHash.startsWith('$argon2');
  }

  static async compare (dto: CompareDto): Promise<void> {
    const isMatch = await SessionHelper.verify(dto);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
  }

  static async rejectWithDummyHash ({ password }: HashDto): Promise<never> {
    SessionHelper.dummyPasswordHash ??= SessionHelper.hash({ password: CryptoHelper.uuid() });
    await SessionHelper.verify({ password, passwordHash: await SessionHelper.dummyPasswordHash });
    throw new UnauthorizedException('Invalid credentials');
  }

  static getSessionUser ({ context }: GetSessionUserDto): SessionData {
    if (!context.user) throw new UnauthorizedException('User not authenticated');
    return context.user;
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

  private static async verify ({ password, passwordHash }: CompareDto): Promise<boolean> {
    if (SessionHelper.isLegacyHash({ passwordHash })) return bcrypt.compare(password, passwordHash);

    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
