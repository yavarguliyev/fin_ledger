import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, StandardSchemaValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BaseHelper, ClientIds, ENVIRONMENT_CONSTANTS, GracefulShutdown } from '@common/libs';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap (): Promise<void> {
  const {
    LOGGING: { BOOTSTRAP_CONTEXT },
    SERVER: { NODE_ENV, DEFAULT_PORT, DEFAULT_HOST, API_PREFIX, BODY_LIMIT },
    CORS: { ORIGIN, CREDENTIALS },
    SWAGGER: { TITLE, DESCRIPTION, VERSION }
  } = ENVIRONMENT_CONSTANTS;

  const logger = new Logger(BOOTSTRAP_CONTEXT);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  const environemnt = configService.get<number>('NODE_ENV') ?? NODE_ENV;
  const port = configService.get<number>('PORT') ?? DEFAULT_PORT;
  const host = configService.get<string>('HOST') ?? DEFAULT_HOST;
  const trustProxy = configService.get<number>('TRUST_PROXY') ?? 0;

  app.set('trust proxy', trustProxy);
  app.use(helmet());
  app.useBodyParser('json', { limit: BODY_LIMIT });
  app.useBodyParser('urlencoded', { limit: BODY_LIMIT, extended: true });
  app.enableVersioning({ type: VersioningType.URI, prefix: API_PREFIX });
  app.enableCors({ origin: ORIGIN, credentials: CREDENTIALS });
  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      validateCustomDecorators: true,
      exceptionFactory: (issues): BadRequestException => new BadRequestException({ message: 'Validation failed', errors: issues })
    })
  );
  GracefulShutdown.register({ app, context: ClientIds.API_GATEWAY });

  if (environemnt === NODE_ENV) {
    const options = { title: TITLE, description: DESCRIPTION, version: VERSION, path: 'api-docs' };
    BaseHelper.setupSwagger({ app, options });
  }

  await app.listen(port, host, () => logger.log(`🚀 ${ClientIds.API_GATEWAY} started on http://${host}:${port}`));
}

void bootstrap().catch((error: Error) => {
  new Logger(ENVIRONMENT_CONSTANTS.LOGGING.BOOTSTRAP_CONTEXT).error(`Bootstrap failed: ${error.message}`, error.stack);
  process.exit(1);
});
