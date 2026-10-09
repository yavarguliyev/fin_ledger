import { z } from 'zod';

export const BaseSmsTransportSchema = z.object({
  from: z.string({ message: 'From must be a string' })
});

export type BaseSmsTransportDto = z.infer<typeof BaseSmsTransportSchema>;
