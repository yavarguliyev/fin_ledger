import { HttpErrorResponse } from '@angular/common/http';

import { PUBLIC_ALLOWED_COMPONENTS } from '../../constants/auth/public-allowed-components.constant';
import { SESSION } from '../../constants/auth/session.constant';
import { UrlRefDto } from '../../dtos/http/url-ref.dto';

export class AuthInterceptorHelper {
  static isPublic ({ url }: UrlRefDto): boolean {
    return PUBLIC_ALLOWED_COMPONENTS.some(path => url.includes(path));
  }

  static noSession ({ url }: UrlRefDto): HttpErrorResponse {
    return new HttpErrorResponse({ status: SESSION.UNAUTHORIZED, statusText: SESSION.NO_SESSION_MESSAGE, url });
  }
}
