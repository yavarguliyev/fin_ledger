import type { DomainErrorInputDto } from '../dtos/errors/domain-error.dto';

export class DomainError extends Error {
  readonly code: string;

  constructor ({ message, code }: DomainErrorInputDto) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}
