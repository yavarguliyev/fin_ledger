import type { Logger } from '@nestjs/common';
import { z } from 'zod';

export const ConsoleSmsTransportSchema = z.object({
  logger: z.custom<Logger>(),

  revealBody: z.boolean({ message: 'Reveal body must be a boolean' })
});

export type ConsoleSmsTransportDto = z.infer<typeof ConsoleSmsTransportSchema>;
