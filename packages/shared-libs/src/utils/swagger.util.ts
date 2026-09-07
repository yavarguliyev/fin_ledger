import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { SwaggerOptions } from '../interfaces/base.interface';

export const setupSwagger = (app: INestApplication, options: SwaggerOptions): OpenAPIObject => {
  const { title, description, version, path, bearerAuthName, customOptions = { swaggerOptions: { persistAuthorization: true } } } = options;

  const documentBuilder = new DocumentBuilder().setTitle(title).setDescription(description).setVersion(version).addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
      description: 'Enter JWT token'
    },
    bearerAuthName
  );

  const swaggerConfig = documentBuilder.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(path, app, document, customOptions);

  return document;
};
