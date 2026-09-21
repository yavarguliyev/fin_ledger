import type { ApplicationErrorInputDto } from '../dtos/errors/application-error.dto';

export class ApplicationError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor ({ message, code, statusCode = 400 }: ApplicationErrorInputDto) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
