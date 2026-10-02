import { EXCEPTION_LOG_DEFAULTS } from '../constants/errors/exception-log-defaults.constant';
import { HTTP_STATUS_RANGES } from '../constants/errors/http-status-ranges.constant';
import { ExceptionStatusDto } from '../dtos/filter/exception-status.dto';
import { WriteExceptionLogDto } from '../dtos/filter/write-exception-log.dto';
import { BaseHelper } from './base.helper';

export class ExceptionLogHelper {
  static levelFor ({ status }: ExceptionStatusDto): string {
    const { LEVELS, QUIET_STATUSES } = EXCEPTION_LOG_DEFAULTS;
    if (status >= HTTP_STATUS_RANGES.SERVER_ERROR_MIN) return LEVELS.ERROR;
    return QUIET_STATUSES.includes(status) ? LEVELS.DEBUG : LEVELS.WARN;
  }

  static write ({ logger, exception, correlationId, request, status }: WriteExceptionLogDto): void {
    const error = BaseHelper.errorResponse({ error: exception });
    const method = request.method || EXCEPTION_LOG_DEFAULTS.METHOD;
    const url = request.url || EXCEPTION_LOG_DEFAULTS.URL;
    const type = exception?.constructor?.name || EXCEPTION_LOG_DEFAULTS.TYPE;
    const cause = exception instanceof Error && exception.cause !== undefined ? BaseHelper.errorResponse({ error: exception.cause }).message : undefined;
    const message = error.message.startsWith(`${type}: `) ? error.message.slice(type.length + EXCEPTION_LOG_DEFAULTS.TYPE_SEPARATOR.length) : error.message;
    const line = `[${method}] ${url} ${status} ${type}: ${message}${cause ? ` (cause: ${cause})` : ''} correlationId=${correlationId}`;
    const level = ExceptionLogHelper.levelFor({ status });

    if (level === EXCEPTION_LOG_DEFAULTS.LEVELS.ERROR) logger.error(line, exception instanceof Error ? exception.stack : undefined);
    else if (level === EXCEPTION_LOG_DEFAULTS.LEVELS.WARN) logger.warn(line);
    else logger.debug(line);
  }
}
