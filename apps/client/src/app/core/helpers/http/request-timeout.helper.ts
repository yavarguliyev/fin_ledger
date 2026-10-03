import { REQUEST_TIMEOUT } from '../../constants/http/request-timeout.constant';
import { RequestBodyRefDto } from '../../interfaces/http/request-body-ref.interface';

export class RequestTimeoutHelper {
  static limitFor ({ body }: RequestBodyRefDto): number {
    return typeof FormData !== 'undefined' && body instanceof FormData ? REQUEST_TIMEOUT.UPLOAD_MS : REQUEST_TIMEOUT.DEFAULT_MS;
  }
}
