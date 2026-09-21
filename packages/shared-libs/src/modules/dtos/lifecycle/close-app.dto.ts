import { z } from 'zod';
import { INestApplication } from '@nestjs/common';

import { ShutdownHook } from '../../types/base.type';

export const CloseAppSchema = z.object({
  app: z.custom<INestApplication>(),

  timeoutMs: z.number({ message: 'timeoutMs must be a number' }),

  onShutdown: z.custom<ShutdownHook>().optional()
});

export type CloseAppDto = z.infer<typeof CloseAppSchema>;
