import { join } from 'node:path';

export const CPU_TASK_RUNNER_TEST = {
  HANG_WORKER: join(__dirname, '..', 'fixtures', 'hang.worker.js'),
  CRASH_WORKER: join(__dirname, '..', 'fixtures', 'crash.worker.js'),
  SHORT_TIMEOUT_MS: 100,
  TIMEOUT_CODE: 'CPU_TASK_TIMEOUT',
  EXIT_CODE: 'CPU_WORKER_EXIT',
  GATEWAY_TIMEOUT: 504
} as const;
