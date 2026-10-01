import type { DatabaseAdapter } from '@common/database';

export interface ScheduleLock {
  adapter: DatabaseAdapter;
  name: string;
}
