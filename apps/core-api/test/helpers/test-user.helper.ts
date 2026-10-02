import * as argon2 from 'argon2';

import { DbHelper } from './db.helper';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { TEST_USERS } from '../constants/test-users.constant';
import { TestUsersDto } from '../interfaces/test-users.interface';

export class TestUserHelper {
  private static passwordHash: Promise<string> | null = null;

  static async ensure ({ emails, role = TEST_USERS.DEFAULT_ROLE }: TestUsersDto): Promise<void> {
    TestUserHelper.passwordHash ??= argon2.hash(SEED_PASSWORD, { type: argon2.argon2id, ...TEST_USERS.ARGON2_OPTIONS });
    await DbHelper.query({ sql: TEST_USERS.CREATE_SQL, params: [emails, await TestUserHelper.passwordHash, role] });
  }
}
