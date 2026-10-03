import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import { ThrottlerException } from '@nestjs/throttler';

import { ExceptionLogHelper } from '../../src/modules/helpers/exception-log.helper';
import { EXCEPTION_LOG_SPEC as E } from '../constants/exception-log.constant';
import { aLogger } from '../fakes/http.fake';

describe('ExceptionLogHelper', () => {
  it('logs expected auth failures at debug, other client errors at warn and server errors at error', () => {
    expect(ExceptionLogHelper.levelFor({ status: E.UNAUTHORIZED })).toBe(E.DEBUG);
    expect(ExceptionLogHelper.levelFor({ status: E.FORBIDDEN })).toBe(E.DEBUG);
    expect(ExceptionLogHelper.levelFor({ status: E.NOT_FOUND })).toBe(E.WARN);
    expect(ExceptionLogHelper.levelFor({ status: E.BAD_REQUEST })).toBe(E.WARN);
    expect(ExceptionLogHelper.levelFor({ status: E.SERVER_ERROR })).toBe(E.ERROR);
  });

  it('writes one line with the status and correlation id, never a second JSON line', () => {
    const { logger, debug, warn } = aLogger();
    const request = { method: E.METHOD, url: E.URL };

    ExceptionLogHelper.write({
      logger,
      exception: new UnauthorizedException(E.EXPIRED),
      correlationId: E.CORRELATION_ID,
      request,
      status: E.UNAUTHORIZED
    });

    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug.mock.calls[0]).toHaveLength(1);
    expect(debug.mock.calls[0]?.[0]).toEqual(expect.stringContaining(`${E.UNAUTHORIZED}`));
    expect(debug.mock.calls[0]?.[0]).toEqual(expect.stringContaining(E.CORRELATION_ID));
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps the stack trace for server errors', () => {
    const { logger, error } = aLogger();

    ExceptionLogHelper.write({
      logger,
      exception: new InternalServerErrorException(E.BROKEN),
      correlationId: E.CORRELATION_ID,
      request: { method: E.METHOD, url: E.URL },
      status: E.SERVER_ERROR
    });

    expect(error).toHaveBeenCalledWith(expect.stringContaining(E.BROKEN), expect.stringContaining('Error'));
  });

});

describe('ExceptionLogHelper message', () => {
  it('does not repeat the exception type when the message already starts with it', () => {
    const { logger, warn } = aLogger();

    ExceptionLogHelper.write({
      logger,
      exception: new ThrottlerException(),
      correlationId: E.CORRELATION_ID,
      request: { method: E.METHOD, url: E.URL },
      status: E.TOO_MANY
    });

    expect(warn.mock.calls[0]?.[0]).toContain(E.THROTTLED_LINE);
    expect(warn.mock.calls[0]?.[0]).not.toContain(E.DOUBLED);
  });
});
