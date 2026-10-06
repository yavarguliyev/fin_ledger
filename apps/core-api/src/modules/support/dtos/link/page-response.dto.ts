import { IncomingMessage } from 'node:http';
import { z } from 'zod';

export const PageResponseSchema = z.object({
  response: z.custom<IncomingMessage>()
});

export type PageResponseDto = z.infer<typeof PageResponseSchema>;
