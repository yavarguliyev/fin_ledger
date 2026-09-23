import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { CORRELATION } from '../constants/http/correlation.constant';
import { CryptoHelper } from '../helpers/crypto.helper';
import { RequestScope } from '../context/request-scope';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use (request: Request & { correlationId?: string }, response: Response, next: NextFunction): void {
    const incoming = request.headers[CORRELATION.HEADER];
    const supplied = Array.isArray(incoming) ? incoming[0] : incoming;
    const correlationId = (supplied ?? '').trim().slice(0, CORRELATION.MAX_LENGTH) || CryptoHelper.uuid();

    request.correlationId = correlationId;
    response.setHeader(CORRELATION.HEADER, correlationId);

    RequestScope.run({ correlationId }, () => next());
  }
}
