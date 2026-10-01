import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { CORRELATION } from '../constants/http/correlation.constant';
import { CryptoHelper } from '../helpers/crypto.helper';
import { RequestScope } from '../context/request-scope';
import { RequestHeaderDto } from '../dtos/http/request-header.dto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use (request: Request & { correlationId?: string }, response: Response, next: NextFunction): void {
    const incoming = request.headers[CORRELATION.HEADER];
    const supplied = Array.isArray(incoming) ? incoming[0] : incoming;
    const correlationId = (supplied ?? '').trim().slice(0, CORRELATION.MAX_LENGTH) || CryptoHelper.uuid();

    request.correlationId = correlationId;
    response.setHeader(CORRELATION.HEADER, correlationId);

    const clientIp = request.ip;

    const deviceId = CorrelationIdMiddleware.header({ value: request.headers[CORRELATION.DEVICE_HEADER], maxLength: CORRELATION.DEVICE_MAX_LENGTH });
    const userAgent = CorrelationIdMiddleware.header({ value: request.headers['user-agent'], maxLength: CORRELATION.USER_AGENT_MAX_LENGTH });

    RequestScope.run({ correlationId, ...(clientIp && { clientIp }), ...(deviceId && { deviceId }), ...(userAgent && { userAgent }) }, () => next());
  }

  private static header ({ value, maxLength }: RequestHeaderDto): string | undefined {
    const supplied = Array.isArray(value) ? value[0] : value;
    const trimmed = (supplied ?? '').trim().slice(0, maxLength);

    return trimmed || undefined;
  }
}
