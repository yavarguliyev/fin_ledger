import { INestApplication } from '@nestjs/common';

import { SwaggerOptions } from '../interfaces/base.interface';

export type ErrorResponseParams = { error: unknown };

export type ValidateLuhnParams = { cardNumber: string };

export type FormatAmountParams = { amountMinor: number; currency: string };

export type SetupSwaggerParams = { app: INestApplication; options: SwaggerOptions };

export type ErrorResponse = { message: string; stack?: string | undefined };
