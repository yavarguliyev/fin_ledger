import type { ArgumentsHost, Logger } from '@nestjs/common';

import { ArgumentsHostFakeDto, LoggerFake } from '../interfaces/fakes.interface';

export const anArgumentsHost = ({ request, response }: ArgumentsHostFakeDto): ArgumentsHost =>
  ({ switchToHttp: () => ({ getResponse: () => response, getRequest: () => request }) }) as unknown as ArgumentsHost;

export const aLogger = (): LoggerFake => {
  const mocks = { debug: jest.fn<void, string[]>(), warn: jest.fn<void, string[]>(), error: jest.fn<void, string[]>() };

  return { ...mocks, logger: mocks as unknown as Logger };
};
