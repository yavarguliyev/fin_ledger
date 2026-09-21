import { z } from 'zod';
import { LoggerService } from '@nestjs/common';

export const ForceExitSchema = z.object({
  logger: z.custom<LoggerService>(),

  exitCode: z.number({ message: 'exitCode must be a number' }),

  reason: z.string({ message: 'Reason must be a string' })
});

export type ForceExitDto = z.infer<typeof ForceExitSchema>;
