import { HttpStatus } from '@nestjs/common';

import type { ApplicationErrorInputDto } from '../dtos/errors/application-error.dto';

export class ApplicationError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor ({ message, code, statusCode = HttpStatus.BAD_REQUEST, cause }: ApplicationErrorInputDto) {
    super(message, { cause });
    this.name = 'ApplicationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
