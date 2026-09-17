import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { ErrorResponseParams, ErrorResponse, FormatAmountParams, SetupSwaggerParams, ValidateLuhnParams } from '../dtos/shared.dto';

export class BaseHelper {
  public static errorResponse (params: ErrorResponseParams): ErrorResponse {
    const { error } = params;

    if (error instanceof Error) return { message: error.message, stack: error.stack ?? undefined };
    if (typeof error === 'string') return { message: error };
    if (error && typeof error === 'object' && 'message' in error) return { message: String(error.message) };
    return { message: 'Internal error' };
  }

  public static formatAmount (params: FormatAmountParams): string {
    const { amountMinor, currency } = params;
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }

  public static setupSwagger (params: SetupSwaggerParams): OpenAPIObject {
    const { app, options } = params;
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
  }

  public static validateLuhn (params: ValidateLuhnParams): boolean {
    const { cardNumber } = params;

    const sanitized = cardNumber.replace(/[\s-]/g, '');
    if (!/^\d{13,19}$/.test(sanitized)) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }
}
