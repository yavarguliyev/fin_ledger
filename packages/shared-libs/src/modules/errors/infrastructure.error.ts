import type { InfrastructureErrorInputDto } from '../dtos/errors/infrastructure-error.dto';

export class InfrastructureError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly httpStatus?: number | undefined;

  constructor ({ message, code, retryable = false, httpStatus }: InfrastructureErrorInputDto) {
    super(message);
    this.name = 'InfrastructureError';
    this.code = code;
    this.retryable = retryable;
    this.httpStatus = httpStatus;
  }
}
