import { DbHelper } from './db.helper';
import { LOCKOUT_RESET } from '../constants/lockout-reset.constant';
import { ClearLockoutDto } from '../interfaces/clear-lockout.interface';

export class LockoutHelper {
  static async clear ({ emails }: ClearLockoutDto): Promise<void> {
    await DbHelper.query({ sql: LOCKOUT_RESET.SQL, params: [emails] });
  }
}
