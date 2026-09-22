import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { ErrorResponseInputDto } from '../dtos/helper/error-response-input.dto';
import { ErrorResponseDto } from '../dtos/helper/error-response.dto';
import { FormatAmountDto } from '../dtos/helper/format-amount.dto';
import { SetupSwaggerDto } from '../dtos/helper/setup-swagger.dto';
import { ValidateLuhnDto } from '../dtos/helper/validate-luhn.dto';
import { CURRENCY_FORMAT } from '../constants/common/currency-format.constant';

export class BaseHelper {
  static errorResponse (params: ErrorResponseInputDto): ErrorResponseDto {
    const { error } = params;

    if (error instanceof Error) return { message: error.message, stack: error.stack ?? undefined };
    if (typeof error === 'string') return { message: error };
    if (error && typeof error === 'object' && 'message' in error) return { message: String(error.message) };
    return { message: 'Internal error' };
  }

  static formatAmount (params: FormatAmountDto): string {
    const { amountMinor, currency } = params;
    const digits = new Intl.NumberFormat(CURRENCY_FORMAT.LOCALE, { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? CURRENCY_FORMAT.DEFAULT_DIGITS;
    return `${(amountMinor / CURRENCY_FORMAT.BASE ** digits).toFixed(digits)} ${currency}`;
  }

  static setupSwagger (params: SetupSwaggerDto): OpenAPIObject {
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

  static validateLuhn (params: ValidateLuhnDto): boolean {
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
