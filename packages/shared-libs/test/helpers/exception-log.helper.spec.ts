import { InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';

import { ExceptionLogHelper } from '../../src/modules/helpers/exception-log.helper';
import { EXCEPTION_LOG_SPEC as E } from '../constants/exception-log.constant';

const fakeLogger = (): jest.Mocked<Pick<Logger, 'debug' | 'warn' | 'error'>> => ({ debug: jest.fn(), warn: jest.fn(), error: jest.fn() });

describe('ExceptionLogHelper', () => {
  it('logs expected auth failures at debug, other client errors at warn and server errors at error', () => {
    expect(ExceptionLogHelper.levelFor({ status: E.UNAUTHORIZED })).toBe(E.DEBUG);
    expect(ExceptionLogHelper.levelFor({ status: E.FORBIDDEN })).toBe(E.DEBUG);
    expect(ExceptionLogHelper.levelFor({ status: E.NOT_FOUND })).toBe(E.WARN);
    expect(ExceptionLogHelper.levelFor({ status: E.BAD_REQUEST })).toBe(E.WARN);
    expect(ExceptionLogHelper.levelFor({ status: E.SERVER_ERROR })).toBe(E.ERROR);
  });

  it('writes one line with the status and correlation id, never a second JSON line', () => {
    const logger = fakeLogger();
    const request = { method: E.METHOD, url: E.URL };

    ExceptionLogHelper.write({
      logger: logger as unknown as Logger,
      exception: new UnauthorizedException(E.EXPIRED),
      correlationId: E.CORRELATION_ID,
      request,
      status: E.UNAUTHORIZED
    });

    expect(logger.debug).toHaveBeenCalledTimes(1);
    expect(logger.debug.mock.calls[0]).toHaveLength(1);
    expect(logger.debug.mock.calls[0]?.[0]).toEqual(expect.stringContaining(`${E.UNAUTHORIZED}`));
    expect(logger.debug.mock.calls[0]?.[0]).toEqual(expect.stringContaining(E.CORRELATION_ID));
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('keeps the stack trace for server errors', () => {
    const logger = fakeLogger();

    ExceptionLogHelper.write({
      logger: logger as unknown as Logger,
      exception: new InternalServerErrorException(E.BROKEN),
      correlationId: E.CORRELATION_ID,
      request: { method: E.METHOD, url: E.URL },
      status: E.SERVER_ERROR
    });

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(E.BROKEN), expect.stringContaining('Error'));
  });
});
