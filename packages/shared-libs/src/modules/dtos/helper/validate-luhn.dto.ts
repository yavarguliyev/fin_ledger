import { z } from 'zod';

export const ValidateLuhnSchema = z.object({
  cardNumber: z.string({ message: 'Card number must be a string' })
});

export type ValidateLuhnDto = z.infer<typeof ValidateLuhnSchema>;
