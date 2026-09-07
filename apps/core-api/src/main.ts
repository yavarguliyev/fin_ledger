import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIds, ENVIRONMENT_CONSTANTS, setupSwagger } from '@common/libs';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from './app.module';

async function bootstrap (): Promise<void> {
  const {
    LOGGING: { BOOTSTRAP_CONTEXT },
    SERVER: { NODE_ENV, DEFAULT_PORT, DEFAULT_HOST, API_PREFIX },
    CORS: { ORIGIN, CREDENTIALS },
    SWAGGER: { TITLE, DESCRIPTION, VERSION }
  } = ENVIRONMENT_CONSTANTS;

  const logger = new Logger(BOOTSTRAP_CONTEXT);
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const environemnt = configService.get<number>('NODE_ENV') ?? NODE_ENV;
  const port = configService.get<number>('PORT') ?? DEFAULT_PORT;
  const host = configService.get<string>('HOST') ?? DEFAULT_HOST;

  app.enableVersioning({ type: VersioningType.URI, prefix: API_PREFIX });
  app.enableCors({ origin: ORIGIN, credentials: CREDENTIALS });
  app.useGlobalPipes(new ZodValidationPipe());

  if (environemnt === NODE_ENV) setupSwagger(app, { title: TITLE, description: DESCRIPTION, version: VERSION, path: 'api-docs' });

  await app.listen(port, host, () => logger.log(`🚀 ${ClientIds.API_GATEWAY} started on http://${host}:${port}`));
}

void bootstrap();
