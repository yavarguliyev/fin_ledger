import type { NextFunction, Request, RequestHandler, Response } from 'express';
import helmet from 'helmet';

import { SECURITY_HEADERS as H } from '../constants/config/security-headers.constant';
import { SecurityHeadersOptionsDto } from '../dtos/security-headers-options.dto';

export class SecurityHeadersHelper {
  static middleware ({ docsPath }: SecurityHeadersOptionsDto): RequestHandler {
    const docs = helmet();
    const api = helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: { defaultSrc: H.NONE, frameAncestors: H.NONE, baseUri: H.NONE, formAction: H.NONE }
      },
      strictTransportSecurity: { maxAge: H.HSTS_MAX_AGE_SECONDS, includeSubDomains: true },
      referrerPolicy: { policy: H.REFERRER_POLICY },
      frameguard: { action: H.FRAME_GUARD },
      crossOriginResourcePolicy: { policy: H.RESOURCE_POLICY }
    });
    const docsPrefix = `${H.PATH_SEPARATOR}${docsPath}`;

    return (request: Request, response: Response, next: NextFunction): void =>
      (request.path.startsWith(docsPrefix) ? docs : api)(request, response, next);
  }
}
