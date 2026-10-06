import { z } from 'zod';

export const BaseTransportSchema = z.object({
  from: z.string({ message: 'From must be a string' })
});

export type BaseTransportDto = z.infer<typeof BaseTransportSchema>;
