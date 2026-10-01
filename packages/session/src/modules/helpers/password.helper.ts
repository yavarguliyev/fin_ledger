import * as argon2 from 'argon2';

import { ARGON2_OPTIONS } from '../constants/password/argon2-options.constant';
import { CompareDto } from '../dtos/helper/compare.dto';
import { HashDto } from '../dtos/helper/hash.dto';
import { PASSWORD_PREFIXES } from '../constants/password/password-prefixes.constant';

export class PasswordHelper {
  static async hash ({ password }: HashDto): Promise<string> {
    return argon2.hash(password, ARGON2_OPTIONS);
  }

  static async matches ({ password, passwordHash }: CompareDto): Promise<boolean> {
    if (!passwordHash.startsWith(PASSWORD_PREFIXES.ARGON2)) return false;

    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
