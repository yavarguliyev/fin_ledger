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
import { EXCEPTION_LOG_DEFAULTS } from '../constants/errors/exception-log-defaults.constant';
import { HTTP_STATUS_RANGES } from '../constants/errors/http-status-ranges.constant';
import { BaseHelper } from '../helpers/base.helper';
import { CryptoHelper } from '../helpers/crypto.helper';
import { MapExceptionDto } from '../dtos/filter/map-exception.dto';
import { LogExceptionDto } from '../dtos/filter/log-exception.dto';
import { ExceptionRefDto } from '../dtos/filter/exception-ref.dto';
import { ClientMessageDto } from '../dtos/filter/client-message.dto';
import { MapHttpExceptionDto } from '../dtos/filter/map-http-exception.dto';

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
    const isClientError = exception.status >= HTTP_STATUS_RANGES.CLIENT_ERROR_MIN && exception.status < HTTP_STATUS_RANGES.SERVER_ERROR_MIN;
    return isClientError ? { message: exception.message, status: exception.status } : null;
  }

  private isWarning ({ exception }: ExceptionRefDto): boolean {
    return this.resolveStatus({ exception }) < HTTP_STATUS_RANGES.SERVER_ERROR_MIN;
  }

  private clientMessage ({ status, message }: ClientMessageDto): string {
    if (status < HTTP_STATUS_RANGES.SERVER_ERROR_MIN) return message;
    return status === HTTP_STATUS_RANGES.UNAVAILABLE ? ERROR_RESPONSES.UNAVAILABLE_MESSAGE : ERROR_RESPONSES.INTERNAL.MESSAGE;
  }

  private resolveStatus ({ exception }: ExceptionRefDto): number {
    if (exception instanceof HttpException) return exception.getStatus();
    if (exception instanceof ApplicationError) return exception.statusCode;
    if (exception instanceof DomainError) return HttpStatus.BAD_REQUEST;
    if (exception instanceof InfrastructureError) return exception.retryable ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof Error && JWT_ERROR_NAMES.includes(exception.constructor.name)) return HttpStatus.UNAUTHORIZED;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private logException ({ exception, correlationId, request }: LogExceptionDto): void {
    const error = BaseHelper.errorResponse({ error: exception });
    const method = request.method || EXCEPTION_LOG_DEFAULTS.METHOD;
    const url = request.url || EXCEPTION_LOG_DEFAULTS.URL;
    const exceptionType = exception?.constructor?.name || EXCEPTION_LOG_DEFAULTS.TYPE;
    const cause =
      exception instanceof Error && exception.cause !== undefined ? BaseHelper.errorResponse({ error: exception.cause }).message : undefined;
    const message = `[${method}] ${url} - ${exceptionType}: ${error.message}`;
    const logContext = JSON.stringify({ correlationId, method, url, type: exceptionType, message: error.message, ...(cause && { cause }) });

    if (this.isWarning({ exception })) {
      this.logger.warn(message, logContext);
      return;
    }

    this.logger.error(message, exception instanceof Error ? exception.stack || '' : '', logContext);
  }

  private mapHttpException ({ exception, correlationId }: MapHttpExceptionDto): MapExceptionRecord {
    const status = exception.getStatus();
    const responsePayload = exception.getResponse();

    const payload = typeof responsePayload === 'object' && responsePayload !== null ? responsePayload : undefined;

    const raised =
      typeof responsePayload === 'string'
        ? responsePayload
        : payload && 'message' in payload && typeof payload.message === 'string'
          ? payload.message
          : ERROR_RESPONSES.REQUEST_FAILED_MESSAGE;

    const isServerError = status >= HTTP_STATUS_RANGES.SERVER_ERROR_MIN;
    const details = !isServerError && payload && 'errors' in payload ? payload.errors : undefined;

    return {
      success: false,
      error: {
        code: `${ERROR_RESPONSES.HTTP_CODE_PREFIX}${status}`,
        message: this.clientMessage({ status, message: raised }),
        ...(details !== undefined && { details }),
        retryable: isServerError
      },
      correlationId
    };
  }

  private mapException ({ exception, correlationId }: MapExceptionDto): MapExceptionRecord {
    if (exception instanceof HttpException) return this.mapHttpException({ exception, correlationId });

    if (exception instanceof DomainError) {
      return { success: false, error: { code: exception.code, message: exception.message, retryable: false }, correlationId };
    }

    if (exception instanceof ApplicationError) {
      return {
        success: false,
        error: { code: exception.code, message: exception.message, retryable: exception.statusCode >= HTTP_STATUS_RANGES.SERVER_ERROR_MIN },
        correlationId
      };
    }

    if (exception instanceof InfrastructureError) {
      return {
        success: false,
        error: {
          code: exception.code,
          message: this.clientMessage({ status: this.resolveStatus({ exception }), message: exception.message }),
          retryable: exception.retryable
        },
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
