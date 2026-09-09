import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

import { errorResponse } from '../helpers/error-response.helper';
import { ApplicationError } from '../errors/application.error';
import { DomainError } from '../errors/domain.error';
import { InfrastructureError } from '../errors/infrastructure.error';
import { CatchExceptionRecord, LogExceptionRecord, MapExceptionRecord } from '../interfaces/base.interface';
import { JWT_ERROR_NAMES } from '../constants/shared.constant';

@Catch()
export class UnifiedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnifiedExceptionFilter.name);

  catch (exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<CatchExceptionRecord>();
    const correlationId = request.correlationId || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const body = this.mapException(exception, correlationId);
    this.logException(exception, correlationId, request);
    response.status(this.resolveStatus(exception)).json(body);
  }

  private isWarning (exception: unknown): boolean {
    if (exception instanceof HttpException) return exception.getStatus() < 500;
    return exception instanceof DomainError || exception instanceof ApplicationError;
  }

  private resolveStatus (exception: unknown): number {
    if (exception instanceof HttpException) return exception.getStatus();
    if (exception instanceof ApplicationError) return exception.statusCode;
    if (exception instanceof DomainError) return 400;
    if (exception instanceof InfrastructureError) return exception.retryable ? 503 : 500;
    if (exception instanceof Error && JWT_ERROR_NAMES.includes(exception.constructor.name)) return 401;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private logException (exception: unknown, correlationId: string, request: LogExceptionRecord): void {
    const error = errorResponse(exception);
    const method = request.method || 'UNKNOWN';
    const url = request.url || 'unknown';
    const exceptionType = exception?.constructor?.name || 'UnknownError';
    const message = `[${method}] ${url} - ${exceptionType}: ${error.message}`;
    const logContext = JSON.stringify({ correlationId, method, url, type: exceptionType, message: error.message });

    if (this.isWarning(exception)) {
      this.logger.warn(message, logContext);
      return;
    }

    this.logger.error(message, exception instanceof Error ? exception.stack || '' : '', logContext);
  }

  private mapException (exception: unknown, correlationId: string): MapExceptionRecord {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responsePayload = exception.getResponse();

      const message =
        typeof responsePayload === 'string'
          ? responsePayload
          : typeof responsePayload === 'object' &&
              responsePayload !== null &&
              'message' in responsePayload &&
              typeof responsePayload.message === 'string'
            ? responsePayload.message
            : 'Request failed';

      const details =
        typeof responsePayload === 'object' && responsePayload !== null && 'errors' in responsePayload ? responsePayload.errors : undefined;

      return {
        success: false,
        error: { code: `HTTP_${status}`, message, ...(details !== undefined && { details }), retryable: status >= 500 },
        correlationId
      };
    }

    if (exception instanceof DomainError) {
      return { success: false, error: { code: exception.code, message: exception.message, retryable: false }, correlationId };
    }

    if (exception instanceof ApplicationError) {
      return {
        success: false,
        error: { code: exception.code, message: exception.message, retryable: exception.statusCode >= 500 },
        correlationId
      };
    }

    if (exception instanceof InfrastructureError) {
      return {
        success: false,
        error: { code: exception.code, message: exception.message, retryable: exception.retryable },
        correlationId
      };
    }

    return { success: false, error: { code: 'INTERNAL_ERROR', message: errorResponse(exception).message, retryable: true }, correlationId };
  }
}
