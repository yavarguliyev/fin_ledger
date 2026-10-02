import { z } from 'zod';
import type { Logger } from '@nestjs/common';

import { LogExceptionSchema } from './log-exception.dto';

export const WriteExceptionLogSchema = LogExceptionSchema.extend({
  logger: z.custom<Logger>(),

  status: z.number({ message: 'Status must be a number' }).int()
});

export type WriteExceptionLogDto = z.infer<typeof WriteExceptionLogSchema>;
