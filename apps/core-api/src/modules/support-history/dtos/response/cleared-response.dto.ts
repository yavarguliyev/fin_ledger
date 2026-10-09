import { z } from 'zod';

export const ClearedResponseSchema = z.object({
  cleared: z.number({ message: 'Cleared must be a number' })
});

export type ClearedResponseDto = z.infer<typeof ClearedResponseSchema>;
