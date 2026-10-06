import { INestApplicationContext } from '@nestjs/common';
import { z } from 'zod';

import { ShutdownHook } from '../../types/base.type';

export const CloseAppSchema = z.object({
  app: z.custom<INestApplicationContext>(),

  timeoutMs: z.number({ message: 'timeoutMs must be a number' }),

  onShutdown: z.custom<ShutdownHook>().optional()
});

export type CloseAppDto = z.infer<typeof CloseAppSchema>;
