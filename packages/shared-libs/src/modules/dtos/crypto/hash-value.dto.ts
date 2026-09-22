import { z } from 'zod';

export const HashValueSchema = z.object({
  value: z.string({ message: 'Value must be a string' })
});

export type HashValueDto = z.infer<typeof HashValueSchema>;
