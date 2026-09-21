import { z } from 'zod';
import { INestApplication, LoggerService } from '@nestjs/common';

import { ShutdownHook } from '../../types/base.type';
import { ClientIds } from '../../enums/common/client.enum';

export const GracefulShutdownSchema = z.object({
  app: z.custom<INestApplication>(),

  context: z.enum(ClientIds).optional(),

  logger: z.custom<LoggerService>().optional(),

  signals: z.array(z.custom<NodeJS.Signals>()).optional(),

  timeoutMs: z.number({ message: 'timeoutMs must be a number' }).optional(),

  exitCode: z.number({ message: 'exitCode must be a number' }).optional(),

  onShutdown: z.custom<ShutdownHook>().optional(),

  handleFatalErrors: z.boolean().optional()
});

export type GracefulShutdownDto = z.infer<typeof GracefulShutdownSchema>;
