import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, StandardSchemaValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  BaseHelper,
  ClientIds,
  ENVIRONMENT_CONSTANTS,
  Environment,
  ERROR_RESPONSES,
  ExperimentalWarningFilter,
  ThreadPool,
  RedactingLogger,
  GracefulShutdown,
  TaskWorkerService
} from '@common/libs';

import { AppModule } from './app.module';
import { SecurityHeadersHelper } from './shared/helpers/security-headers.helper';
import { RUNTIME } from './shared/constants/config/runtime.constant';

ExperimentalWarningFilter.install();
ThreadPool.configure();

async function bootstrap (): Promise<void> {
  const {
    LOGGING: { BOOTSTRAP_CONTEXT },
    SERVER: { NODE_ENV, DEFAULT_PORT, DEFAULT_HOST, API_PREFIX, BODY_LIMIT },
    CORS: { CREDENTIALS },
    SWAGGER: { TITLE, DESCRIPTION, VERSION, PATH }
  } = ENVIRONMENT_CONSTANTS;

  const logger = new Logger(BOOTSTRAP_CONTEXT);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger: new RedactingLogger({ revealLinks: process.env[RUNTIME.NODE_ENV_KEY] !== Environment.Production })
  });
  const configService = app.get(ConfigService);

  const environment = configService.get<Environment>('NODE_ENV') ?? NODE_ENV;
  const port = configService.get<number>('PORT') ?? DEFAULT_PORT;
  const host = configService.get<string>('HOST') ?? DEFAULT_HOST;
  const trustProxy = configService.getOrThrow<number>('TRUST_PROXY');
  const allowedOrigins = configService.getOrThrow<string[]>('ALLOWED_ORIGINS');

  app.set('trust proxy', trustProxy);
  app.use(SecurityHeadersHelper.middleware({ docsPath: PATH }));
  app.useBodyParser('json', { limit: BODY_LIMIT });
  app.useBodyParser('urlencoded', { limit: BODY_LIMIT, extended: true });
  app.useBodyParser('text', { limit: BODY_LIMIT });
  app.enableVersioning({ type: VersioningType.URI, prefix: API_PREFIX });
  app.enableCors({ origin: allowedOrigins, credentials: CREDENTIALS });

  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      validateCustomDecorators: true,
      exceptionFactory: (issues): BadRequestException =>
        new BadRequestException({ message: ERROR_RESPONSES.VALIDATION_FAILED_MESSAGE, errors: issues })
    })
  );

  app.get(TaskWorkerService).start();

  GracefulShutdown.register({ app, context: ClientIds.API_GATEWAY });

  if (environment !== Environment.Production) {
    const options = { title: TITLE, description: DESCRIPTION, version: VERSION, path: PATH };
    BaseHelper.setupSwagger({ app, options });
  }

  await app.listen(port, host, () => logger.log(`🚀 ${ClientIds.API_GATEWAY} started on http://${host}:${port}`));
}

void bootstrap().catch((error: Error) => {
  new Logger(ENVIRONMENT_CONSTANTS.LOGGING.BOOTSTRAP_CONTEXT).error(`Bootstrap failed: ${error.message}`, error.stack);
  process.exit(1);
});
