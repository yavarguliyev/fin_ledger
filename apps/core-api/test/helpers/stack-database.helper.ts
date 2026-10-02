import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { CryptoHelper } from '@common/shared-libs';

import { INTEGRATION_STACK as S } from '../constants/integration-stack.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { DatabaseUrlRef } from '../interfaces/database-url-ref.interface';
import { StackDatabase } from '../interfaces/stack-database.interface';
import { PostgresRef } from '../interfaces/postgres-ref.interface';

export class StackDatabaseHelper {
  static readonly APP_DIR = path.resolve(__dirname, '../..');
  static readonly REPO_ROOT = path.resolve(StackDatabaseHelper.APP_DIR, '../..');

  static prepare ({ postgres }: PostgresRef): StackDatabase {
    const databaseUrl = postgres.getConnectionUri();
    StackDatabaseHelper.migrate({ databaseUrl });

    const appDbPassword = CryptoHelper.randomToken({ bytes: S.DB_PASSWORD_BYTES });
    execFileSync(process.execPath, [path.join(StackDatabaseHelper.REPO_ROOT, S.PROVISION_SCRIPT)], {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        APP_API_DB_USERNAME: S.APP_DB_USERNAME,
        APP_API_DB_PASSWORD: appDbPassword,
        APP_WORKER_DB_USERNAME: S.APP_WORKER_USERNAME,
        APP_WORKER_DB_PASSWORD: appDbPassword
      },
      stdio: 'pipe'
    });

    const appDatabaseUrl = `postgres://${S.APP_DB_USERNAME}:${appDbPassword}@${postgres.getHost()}:${postgres.getPort()}/${postgres.getDatabase()}`;
    return { databaseUrl, appDatabaseUrl, appDbPassword };
  }

  private static migrate ({ databaseUrl }: DatabaseUrlRef): void {
    execFileSync(
      path.join(StackDatabaseHelper.REPO_ROOT, S.MIGRATE_BIN),
      ['up', '--migrations-dir', path.join(StackDatabaseHelper.APP_DIR, S.MIGRATIONS_DIR)],
      { env: { ...process.env, DATABASE_URL: databaseUrl, DEMO_USER_PASSWORD: SEED_PASSWORD }, stdio: 'pipe' }
    );
  }
}
