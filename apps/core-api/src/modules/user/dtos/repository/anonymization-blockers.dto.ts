import { z } from 'zod';

export const AnonymizationBlockersSchema = z.object({
  balanceMinor: z.coerce.number({ message: 'Balance must be a number' }),

  openPayments: z.coerce.number({ message: 'Open payments must be a number' }),

  openBets: z.coerce.number({ message: 'Open bets must be a number' })
});

export type AnonymizationBlockersDto = z.infer<typeof AnonymizationBlockersSchema>;
