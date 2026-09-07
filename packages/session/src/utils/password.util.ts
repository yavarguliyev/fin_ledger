import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AUTH_CONSTANTS } from '../constants/auth.constant';

@Injectable()
export class PasswordHandler {
  async hash (password: string): Promise<string> {
    return bcrypt.hash(password, AUTH_CONSTANTS.BCRYPT_ROUNDS);
  }

  async compare (password: string, passwordHash: string): Promise<void> {
    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
  }
}
