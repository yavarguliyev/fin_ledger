import { availableParallelism } from 'node:os';

import { THREAD_POOL } from '../constants/lifecycle/thread-pool.constant';
import { ThreadPoolConfigDto } from '../dtos/lifecycle/thread-pool-config.dto';

export class ThreadPool {
  static configure ({ env, cpus }: ThreadPoolConfigDto = { env: process.env, cpus: availableParallelism() }): number {
    const configured = Number(env[THREAD_POOL.ENV_KEY]);
    const size = configured > 0 ? configured : Math.min(Math.max(cpus, THREAD_POOL.MIN_SIZE), THREAD_POOL.MAX_SIZE);
    env[THREAD_POOL.ENV_KEY] = String(size);
    return size;
  }
}
