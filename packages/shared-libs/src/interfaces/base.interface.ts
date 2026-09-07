import { SwaggerCustomOptions } from '@nestjs/swagger';

export interface SwaggerOptions {
  readonly title: string;
  readonly description: string;
  readonly version: string;
  readonly path: string;
  readonly bearerAuthName?: string;
  readonly customOptions?: SwaggerCustomOptions;
}

export interface LogExceptionRecord {
  readonly url: string;
  readonly method: string;
}

export interface CatchExceptionRecord extends LogExceptionRecord {
  readonly correlationId: string;
}

export interface MapExceptionRecord {
  readonly success: boolean;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly retryable: boolean;
  };
  readonly correlationId: string;
}
