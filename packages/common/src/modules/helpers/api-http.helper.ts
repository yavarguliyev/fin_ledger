import { BadRequestException, Logger, StandardSchemaValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHelper, ClientIds, ERROR_RESPONSES, Environment } from '@common/shared-libs';
import { ENVIRONMENT_CONSTANTS } from '@common/env';

import { HttpAppDto } from '../dtos/bootstrap/http-app.dto';
import { APP_BOOTSTRAP as B } from '../constants/bootstrap/app-bootstrap.constant';
import { SecurityHeadersHelper } from './security-headers.helper';

export class ApiHttpHelper {
  static async configure (this: void, { app }: HttpAppDto): Promise<void> {
    const { SERVER, LOGGING, SWAGGER } = ENVIRONMENT_CONSTANTS;
    const config = app.get(ConfigService);
    const environment = config.get<Environment>(B.NODE_ENV_KEY) ?? SERVER.NODE_ENV;
    const port = config.get<number>(B.PORT_KEY) ?? SERVER.DEFAULT_PORT;
    const host = config.get<string>(B.HOST_KEY) ?? SERVER.DEFAULT_HOST;

    ApiHttpHelper.applyMiddleware({ app });

    if (environment !== Environment.Production) {
      const options = { title: SWAGGER.TITLE, description: SWAGGER.DESCRIPTION, version: SWAGGER.VERSION, path: SWAGGER.PATH };
      BaseHelper.setupSwagger({ app, options });
    }

    const logger = new Logger(LOGGING.BOOTSTRAP_CONTEXT);
    await app.listen(port, host, () => logger.log(`🚀 ${ClientIds.API_GATEWAY} started on http://${host}:${port}`));
  }

  private static applyMiddleware ({ app }: HttpAppDto): void {
    const { SERVER, CORS, SWAGGER } = ENVIRONMENT_CONSTANTS;
    const config = app.get(ConfigService);

    app.set(B.TRUST_PROXY_SETTING, config.getOrThrow<number>(B.TRUST_PROXY_KEY));
    app.use(SecurityHeadersHelper.middleware({ docsPath: SWAGGER.PATH }));
    app.useBodyParser(B.JSON_PARSER, { limit: SERVER.BODY_LIMIT });
    app.useBodyParser(B.URLENCODED_PARSER, { limit: SERVER.BODY_LIMIT, extended: true });
    app.useBodyParser(B.TEXT_PARSER, { limit: SERVER.BODY_LIMIT });
    app.enableVersioning({ type: VersioningType.URI, prefix: SERVER.API_PREFIX });
    app.enableCors({ origin: config.getOrThrow<string[]>(B.ALLOWED_ORIGINS_KEY), credentials: CORS.CREDENTIALS });
    app.useGlobalPipes(
      new StandardSchemaValidationPipe({
        validateCustomDecorators: true,
        exceptionFactory: (issues): BadRequestException => new BadRequestException({ message: ERROR_RESPONSES.VALIDATION_FAILED_MESSAGE, errors: issues })
      })
    );
  }
}
