import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

import { ApplicationError } from '../errors/application.error';
import { DomainError } from '../errors/domain.error';
import { InfrastructureError } from '../errors/infrastructure.error';
import { CatchExceptionRecord } from '../interfaces/catch-exception-record.interface';
import { ExposedHttpErrorRecord } from '../interfaces/exposed-http-error-record.interface';
import { MapExceptionRecord } from '../interfaces/map-exception-record.interface';
import { JWT_ERROR_NAMES } from '../constants/auth/jwt-error-names.constant';
import { ERROR_RESPONSES } from '../constants/errors/error-responses.constant';
import { BaseHelper } from '../helpers/base.helper';
import { CryptoHelper } from '../helpers/crypto.helper';
import { MapExceptionDto } from '../dtos/filter/map-exception.dto';
import { LogExceptionDto } from '../dtos/filter/log-exception.dto';
import { ExceptionRefDto } from '../dtos/filter/exception-ref.dto';

@Catch()
export class UnifiedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnifiedExceptionFilter.name);

  catch (thrown: unknown, host: ArgumentsHost): void {
    const exception = this.normalize({ exception: thrown });
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<CatchExceptionRecord>();
    const correlationId = request.correlationId || CryptoHelper.uuid();
    const body = this.mapException({ exception, correlationId });
    this.logException({ exception, correlationId, request });
    response.status(this.resolveStatus({ exception })).json(body);
  }

  private normalize ({ exception }: ExceptionRefDto): unknown {
    const exposed = this.exposedHttpErrorOf({ exception });
    return exposed ? new HttpException(exposed.message, exposed.status) : exception;
  }

  private exposedHttpErrorOf ({ exception }: ExceptionRefDto): ExposedHttpErrorRecord | null {
    if (!(exception instanceof Error) || !('status' in exception) || !('expose' in exception)) return null;
    if (exception.expose !== true || typeof exception.status !== 'number') return null;
    return exception.status >= 400 && exception.status < 500 ? { message: exception.message, status: exception.status } : null;
  }

  private isWarning ({ exception }: ExceptionRefDto): boolean {
    if (exception instanceof HttpException) return exception.getStatus() < 500;
    return exception instanceof DomainError || exception instanceof ApplicationError;
  }

  private resolveStatus ({ exception }: ExceptionRefDto): number {
    if (exception instanceof HttpException) return exception.getStatus();
    if (exception instanceof ApplicationError) return exception.statusCode;
    if (exception instanceof DomainError) return 400;
    if (exception instanceof InfrastructureError) return exception.retryable ? 503 : 500;
    if (exception instanceof Error && JWT_ERROR_NAMES.includes(exception.constructor.name)) return 401;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private logException ({ exception, correlationId, request }: LogExceptionDto): void {
    const error = BaseHelper.errorResponse({ error: exception });
    const method = request.method || 'UNKNOWN';
    const url = request.url || 'unknown';
    const exceptionType = exception?.constructor?.name || 'UnknownError';
    const message = `[${method}] ${url} - ${exceptionType}: ${error.message}`;
    const logContext = JSON.stringify({ correlationId, method, url, type: exceptionType, message: error.message });

    if (this.isWarning({ exception })) {
      this.logger.warn(message, logContext);
      return;
    }

    this.logger.error(message, exception instanceof Error ? exception.stack || '' : '', logContext);
  }

  private mapException ({ exception, correlationId }: MapExceptionDto): MapExceptionRecord {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responsePayload = exception.getResponse();

      const payload = typeof responsePayload === 'object' && responsePayload !== null ? responsePayload : undefined;

      const message =
        typeof responsePayload === 'string'
          ? responsePayload
          : payload && 'message' in payload && typeof payload.message === 'string'
            ? payload.message
            : ERROR_RESPONSES.REQUEST_FAILED_MESSAGE;

      const details = payload && 'errors' in payload ? payload.errors : undefined;

      return {
        success: false,
        error: { code: `${ERROR_RESPONSES.HTTP_CODE_PREFIX}${status}`, message, ...(details !== undefined && { details }), retryable: status >= 500 },
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

    return {
      success: false,
      error: { code: ERROR_RESPONSES.INTERNAL.CODE, message: ERROR_RESPONSES.INTERNAL.MESSAGE, retryable: true },
      correlationId
    };
  }
}
