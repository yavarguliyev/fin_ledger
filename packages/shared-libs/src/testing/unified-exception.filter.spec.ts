import { ArgumentsHost, BadRequestException, Logger } from '@nestjs/common';

import { UnifiedExceptionFilter } from '../modules/filters/unified-exception.filter';
import { ERROR_RESPONSES } from '../modules/constants/errors/error-responses.constant';
import { MapExceptionRecord } from '../modules/interfaces/map-exception-record.interface';

const run = (exception: unknown, correlationId = 'corr-1'): { status: number; body: MapExceptionRecord | null } => {
  const captured: { status: number; body: MapExceptionRecord | null } = { status: 0, body: null };
  const json = (payload: MapExceptionRecord): void => {
    captured.body = payload;
  };
  const response = {
    status: (code: number): { json: typeof json } => {
      captured.status = code;
      return { json };
    }
  };
  const request = { method: 'POST', url: '/test', correlationId };
  const http = { getResponse: (): typeof response => response, getRequest: (): typeof request => request };
  const host = { switchToHttp: (): typeof http => http } as unknown as ArgumentsHost;

  new UnifiedExceptionFilter().catch(exception, host);
  return captured;
};

describe('UnifiedExceptionFilter', () => {
  beforeAll((): void => {
    Logger.overrideLogger(false);
  });

  it('hides the message of an unexpected error behind a generic 500', () => {
    const { status, body } = run(new Error('connect ECONNREFUSED 10.0.0.5:5432 password=secret'));

    expect(status).toBe(500);
    expect(body?.error).toMatchObject({ code: ERROR_RESPONSES.INTERNAL.CODE, message: ERROR_RESPONSES.INTERNAL.MESSAGE });
    expect(JSON.stringify(body)).not.toContain('secret');
    expect(body?.correlationId).toBe('corr-1');
  });

  it('keeps the message of an HTTP exception the code raised on purpose', () => {
    const { status, body } = run(new BadRequestException('Invalid authentication code'));

    expect(status).toBe(400);
    expect(body?.error).toMatchObject({ code: `${ERROR_RESPONSES.HTTP_CODE_PREFIX}400`, message: 'Invalid authentication code' });
  });

  it('maps an exposed 4xx error from a body parser to its own status', () => {
    const tooLarge = Object.assign(new Error('request entity too large'), { status: 413, expose: true });

    expect(run(tooLarge).status).toBe(413);
  });

  it('creates a correlation id when the request has none', () => {
    const { body } = run(new Error('boom'), '');

    expect(body?.correlationId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
