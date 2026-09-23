import { ClientIds } from '../../enums/common/client.enum';

export const SHUTDOWN_DEFAULTS = {
  CONTEXT: ClientIds.DEFAULT,
  SIGNALS: ['SIGINT', 'SIGTERM'] as NodeJS.Signals[],
  TIMEOUT_MS: 10_000,
  EXIT_CODE: 0,
  FAILURE_EXIT_CODE: 1
} as const;
