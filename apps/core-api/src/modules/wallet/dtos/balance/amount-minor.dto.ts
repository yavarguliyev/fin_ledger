import { z } from 'zod';

export const AmountMinorSchema = z.object({
  amountMinor: z
    .number({ message: 'Amount must be an integer (minor units)' })
    .int({ message: 'Amount must be an integer (minor units)' })
    .min(1, { message: 'Amount must be greater than 0' })
});

export type AmountMinorDto = z.infer<typeof AmountMinorSchema>;
