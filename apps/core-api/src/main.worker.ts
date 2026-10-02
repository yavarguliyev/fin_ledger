import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Environment, RedactingLogger, TaskWorkerService, ThreadPool } from '@common/libs';

import { WorkerModule } from './worker.module';
import { WORKER } from './shared/constants/modules/worker.constant';
import { RUNTIME } from './shared/constants/config/runtime.constant';

ThreadPool.configure();

async function bootstrapWorker (): Promise<void> {
  const logger = new Logger(WORKER.CONTEXT);
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: false,
    logger: new RedactingLogger({ revealLinks: process.env[RUNTIME.NODE_ENV_KEY] !== Environment.Production })
  });

  app.enableShutdownHooks();
  app.get(TaskWorkerService).start();

  logger.log(WORKER.STARTED_MESSAGE);
}

void bootstrapWorker().catch((error: Error) => {
  new Logger(WORKER.CONTEXT).error(`Worker bootstrap failed: ${error.message}`, error.stack);
  process.exit(WORKER.FAILURE_EXIT_CODE);
});
