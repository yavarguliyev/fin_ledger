import { SwaggerCustomOptions } from '@nestjs/swagger';

export interface SwaggerOptions {
  readonly title: string;
  readonly description: string;
  readonly version: string;
  readonly path: string;
  readonly bearerAuthName?: string;
  readonly customOptions?: SwaggerCustomOptions;
}
