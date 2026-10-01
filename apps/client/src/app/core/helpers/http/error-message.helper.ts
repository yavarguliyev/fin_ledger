import { HttpRequestError } from '../../errors/http-request.error';
import { ErrorMessageDto } from '../../dtos/http/error-message.dto';

export class ErrorMessageHelper {
  static from ({ error, fallback }: ErrorMessageDto): string {
    if (error instanceof HttpRequestError) return error.message;
    if (error instanceof Error && error.message.trim().length > 0) return error.message;
    return fallback;
  }
}
