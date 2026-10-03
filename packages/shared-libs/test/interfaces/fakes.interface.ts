import type { Logger } from '@nestjs/common';

export interface LoggerFake {
  logger: Logger;
  debug: jest.Mock<void, string[]>;
  warn: jest.Mock<void, string[]>;
  error: jest.Mock<void, string[]>;
}

export interface ArgumentsHostFakeDto {
  request: object;
  response: object;
}
