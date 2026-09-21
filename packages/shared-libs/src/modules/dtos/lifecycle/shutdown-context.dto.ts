import { z } from 'zod';
import { INestApplication, LoggerService } from '@nestjs/common';

import { ShutdownHook } from '../../types/base.type';

export const ShutdownContextSchema = z.object({
  app: z.custom<INestApplication>(),

  logger: z.custom<LoggerService>(),

  timeoutMs: z.number({ message: 'timeoutMs must be a number' }),

  exitCode: z.number({ message: 'exitCode must be a number' }),

  onShutdown: z.custom<ShutdownHook>().optional(),

  shuttingDown: z.boolean()
});

export type ShutdownContextDto = z.infer<typeof ShutdownContextSchema>;
