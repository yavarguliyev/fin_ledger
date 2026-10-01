import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Response } from 'express';

import { RoutedRequest } from '../types/routed-request.type';

import { METRICS } from '../constants/metrics.constant';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class RequestDurationInterceptor implements NestInterceptor {
  constructor (private readonly metricsService: MetricsService) {}

  intercept (context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RoutedRequest>();
    const startedAt = process.hrtime.bigint();

    const observe = (): void => {
      const seconds = Number(process.hrtime.bigint() - startedAt) / METRICS.NANOSECONDS_PER_SECOND;

      this.metricsService.observeRequest({
        method: request.method,
        route: request.route?.path ?? METRICS.UNKNOWN_ROUTE,
        status: http.getResponse<Response>().statusCode,
        seconds
      });
    };

    return next.handle().pipe(tap({ next: observe, error: observe }));
  }
}
