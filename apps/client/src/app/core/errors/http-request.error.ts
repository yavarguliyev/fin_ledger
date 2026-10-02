import { HttpRequestErrorDto } from '../interfaces/http/http-request-error.interface';
import { UNKNOWN_OUTCOME_STATUSES } from '../constants/http/unknown-outcome-statuses.constant';

export class HttpRequestError extends Error {
  readonly status: number;
  readonly fieldErrors: Readonly<Record<string, string>>;
  readonly silent: boolean;

  constructor ({ message, status, fieldErrors = {}, silent = false }: HttpRequestErrorDto) {
    super(message);
    this.name = HttpRequestError.name;
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.silent = silent;
  }

  get isOutcomeUnknown (): boolean {
    return UNKNOWN_OUTCOME_STATUSES.includes(this.status) || this.status >= 500;
  }
}
