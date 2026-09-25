import { Logger } from '@nestjs/common';

import { CloseAppDto } from '../dtos/lifecycle/close-app.dto';
import { ForceExitDto } from '../dtos/lifecycle/force-exit.dto';
import { GracefulShutdownDto } from '../dtos/lifecycle/graceful-shutdown.dto';
import { RunShutdownDto } from '../dtos/lifecycle/run-shutdown.dto';
import { ShutdownContextDto } from '../dtos/lifecycle/shutdown-context.dto';
import { SHUTDOWN_DEFAULTS } from '../constants/app/shutdown-defaults.constant';
import { ErrorResponseInputDto } from '../dtos/helper/error-response-input.dto';

export class GracefulShutdown {
  static register (params: GracefulShutdownDto): void {
    const context = GracefulShutdown.toContext(params);
    const signals = params.signals ?? [...SHUTDOWN_DEFAULTS.SIGNALS];
    signals.forEach(signal => process.once(signal, () => void GracefulShutdown.run({ context, signal })));
    if (params.handleFatalErrors === false) return;
    GracefulShutdown.registerFatalErrorHandlers(context);
  }

  private static toContext (params: GracefulShutdownDto): ShutdownContextDto {
    const { app, context = SHUTDOWN_DEFAULTS.CONTEXT, logger, timeoutMs, exitCode, onShutdown } = params;

    return {
      app,
      logger: logger ?? new Logger(`${GracefulShutdown.name}:${context}`),
      timeoutMs: timeoutMs ?? SHUTDOWN_DEFAULTS.TIMEOUT_MS,
      exitCode: exitCode ?? SHUTDOWN_DEFAULTS.EXIT_CODE,
      onShutdown,
      shuttingDown: false
    };
  }

  private static registerFatalErrorHandlers (context: ShutdownContextDto): void {
    process.on('unhandledRejection', reason => {
      context.logger.error?.(`Unhandled rejection: ${GracefulShutdown.describe({ error: reason })}`);
    });

    process.on('uncaughtException', error => {
      context.logger.error?.(`Uncaught exception: ${error.message}`, error.stack);
      void GracefulShutdown.run({ context, signal: 'uncaughtException' });
    });
  }

  private static async run (params: RunShutdownDto): Promise<void> {
    const { context, signal } = params;
    const { logger, exitCode, timeoutMs } = context;

    if (context.shuttingDown) return GracefulShutdown.forceExit({ logger, exitCode, reason: `second ${signal} received` });

    context.shuttingDown = true;
    logger.log?.(`${signal} received, shutting down (up to ${timeoutMs}ms)`);

    try {
      const closed = await GracefulShutdown.closeApp(context);
      if (!closed) return GracefulShutdown.forceExit({ logger, exitCode, reason: `shutdown exceeded ${timeoutMs}ms` });
      logger.log?.('Shutdown complete');
    } catch (error) {
      logger.error?.(`Shutdown failed: ${GracefulShutdown.describe({ error: error })}`);
      return GracefulShutdown.forceExit({ logger, exitCode: SHUTDOWN_DEFAULTS.FAILURE_EXIT_CODE, reason: 'shutdown threw' });
    }

    process.exit(exitCode);
  }

  private static async closeApp (params: CloseAppDto): Promise<boolean> {
    const { app, timeoutMs, onShutdown } = params;
    let timer: NodeJS.Timeout | undefined;

    const expired = new Promise<boolean>(resolve => {
      timer = setTimeout(() => resolve(false), timeoutMs);
      timer.unref();
    });

    const closed = (async (): Promise<boolean> => {
      await app.close();
      await onShutdown?.();

      return true;
    })();

    try {
      return await Promise.race([closed, expired]);
    } finally {
      clearTimeout(timer);
    }
  }

  private static forceExit (params: ForceExitDto): never {
    const { logger, exitCode, reason } = params;
    logger.warn?.(`Forcing exit: ${reason}`);
    return process.exit(exitCode);
  }

  private static describe ({ error }: ErrorResponseInputDto): string {
    return error instanceof Error ? error.message : String(error);
  }
}
