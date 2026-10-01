import type { Logger } from '@nestjs/common';
import { z } from 'zod';

export const ConsoleTransportSchema = z.object({
  logger: z.custom<Logger>(),

  revealLink: z.boolean({ message: 'Reveal link must be a boolean' })
});

export type ConsoleTransportDto = z.infer<typeof ConsoleTransportSchema>;
