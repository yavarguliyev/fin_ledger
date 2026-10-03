import { z } from 'zod';

export const CurrencyVolumeSchema = z.object({
  currency: z.string(),

  amountMinor: z.number()
});

export type CurrencyVolumeDto = z.infer<typeof CurrencyVolumeSchema>;
