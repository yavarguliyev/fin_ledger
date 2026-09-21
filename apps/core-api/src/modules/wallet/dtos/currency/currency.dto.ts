import { z } from 'zod';

export const CurrencySchema = z.object({
  code: z.string({ message: 'Currency code must be a string' }).length(3, { message: 'Currency code must be 3 characters' }),

  name: z.string({ message: 'Currency name must be a string' }),

  minorUnit: z.number({ message: 'Minor unit must be a number' }).int({ message: 'Minor unit must be an integer' }),

  isActive: z.boolean({ message: 'Is active must be a boolean' })
});

export type CurrencyDto = z.infer<typeof CurrencySchema>;
