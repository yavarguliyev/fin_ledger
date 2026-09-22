import { HttpRequestErrorDto } from '../dtos/http/http-request-error.dto';
import { UNKNOWN_OUTCOME_STATUSES } from '../constants/http/unknown-outcome-statuses.constant';

export class HttpRequestError extends Error {
  readonly status: number;

  constructor ({ message, status }: HttpRequestErrorDto) {
    super(message);
    this.name = HttpRequestError.name;
    this.status = status;
  }

  get isOutcomeUnknown (): boolean {
    return UNKNOWN_OUTCOME_STATUSES.includes(this.status) || this.status >= 500;
  }
}
