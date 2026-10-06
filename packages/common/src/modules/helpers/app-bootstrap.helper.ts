import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExperimentalWarningFilter, GracefulShutdown, RedactingLogger, ThreadPool, Environment } from '@common/shared-libs';
import { ENVIRONMENT_CONSTANTS } from '@common/env';

import { AppBootstrapDto } from '../dtos/bootstrap/app-bootstrap.dto';
import { APP_BOOTSTRAP } from '../constants/bootstrap/app-bootstrap.constant';
import { RUNTIME } from '../constants/bootstrap/runtime.constant';

export class AppBootstrap {
  static run ({ module, context, http }: AppBootstrapDto): void {
    ExperimentalWarningFilter.install();
    ThreadPool.configure();

    AppBootstrap.start({ module, context, ...(http && { http }) }).catch((error: Error) => {
      new Logger(ENVIRONMENT_CONSTANTS.LOGGING.BOOTSTRAP_CONTEXT).error(`${context} bootstrap failed: ${error.message}`, error.stack);
      process.exit(APP_BOOTSTRAP.FAILURE_EXIT_CODE);
    });
  }

  private static async start ({ module, context, http }: AppBootstrapDto): Promise<void> {
    const logger = new RedactingLogger({ revealLinks: process.env[RUNTIME.NODE_ENV_KEY] !== Environment.Production });

    if (!http) {
      const app = await NestFactory.createApplicationContext(module, { bufferLogs: false, logger });
      GracefulShutdown.register({ app, context });
      new Logger(context).log(`${context} ${APP_BOOTSTRAP.STARTED_MESSAGE}`);
      return;
    }

    const app = await NestFactory.create<NestExpressApplication>(module, { rawBody: true, logger });
    GracefulShutdown.register({ app, context });
    await http({ app });
  }
}
