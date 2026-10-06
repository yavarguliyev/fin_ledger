export const BACKGROUND_GUARD_SPEC = {
  REPO_ROOT: '../../../..',
  SOURCE_ROOTS: ['apps/core-api/src', 'packages'],
  SOURCE_DIR: 'src',
  SKIPPED_DIRS: ['node_modules', 'dist', 'test'],
  TS_EXTENSION: '.ts',
  TIMER_PATTERN: /\bsetInterval\(/,
  HOOK_PATTERN: /\b(onModuleInit|onApplicationBootstrap) \(/,
  WORKER_MARKER: '@BackgroundWorker(',
  CONNECTION_FILES: ['postgres.service.ts', 'kafka.service.ts', 'rabbitmq.service.ts', 'background-runner.ts']
} as const;
