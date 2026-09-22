import { ArgumentsHost, BadRequestException, HttpStatus, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';

import { UnifiedExceptionFilter } from '../modules/filters/unified-exception.filter';
import { ERROR_RESPONSES } from '../modules/constants/errors/error-responses.constant';
import { ApplicationError } from '../modules/errors/application.error';
import { InfrastructureError } from '../modules/errors/infrastructure.error';
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

beforeAll((): void => {
  Logger.overrideLogger(false);
});

describe('UnifiedExceptionFilter messages', () => {
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

});

describe('UnifiedExceptionFilter statuses and ids', () => {
  it('maps an exposed 4xx error from a body parser to its own status', () => {
    const tooLarge = Object.assign(new Error('request entity too large'), { status: 413, expose: true });

    expect(run(tooLarge).status).toBe(413);
  });

  it('hides the message of a 5xx exception the code raised', () => {
    const { status, body } = run(new InternalServerErrorException('Kafka producer not initialized'));

    expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body?.error).toMatchObject({ code: `${ERROR_RESPONSES.HTTP_CODE_PREFIX}500`, message: ERROR_RESPONSES.INTERNAL.MESSAGE, retryable: true });
  });

  it('answers 503s with the temporarily-unavailable message', () => {
    expect(run(new ServiceUnavailableException('Database disconnect timeout')).body?.error.message).toBe(ERROR_RESPONSES.UNAVAILABLE_MESSAGE);

    const { status, body } = run(new InfrastructureError({ message: 'Database is temporarily unavailable (57P01)', code: 'DATABASE_UNAVAILABLE', retryable: true }));
    expect(status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(body?.error).toMatchObject({ code: 'DATABASE_UNAVAILABLE', message: ERROR_RESPONSES.UNAVAILABLE_MESSAGE, retryable: true });
  });

  it('passes an application error through, whatever its status, but never its cause', () => {
    const pending = run(new ApplicationError({ message: 'Awaiting reconciliation', code: 'DEPOSIT_OUTCOME_PENDING', statusCode: HttpStatus.SERVICE_UNAVAILABLE }));
    expect(pending.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(pending.body?.error).toMatchObject({ code: 'DEPOSIT_OUTCOME_PENDING', message: 'Awaiting reconciliation' });

    const cause = new Error('duplicate key value violates unique constraint "uq_users_email"');
    const duplicate = run(new ApplicationError({ message: 'A record with these details already exists', code: 'DUPLICATE_RESOURCE', statusCode: HttpStatus.CONFLICT, cause }));
    expect(duplicate.status).toBe(HttpStatus.CONFLICT);
    expect(JSON.stringify(duplicate.body)).not.toContain('uq_users_email');
  });

  it('creates a correlation id when the request has none', () => {
    const { body } = run(new Error('boom'), '');

    expect(body?.correlationId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
