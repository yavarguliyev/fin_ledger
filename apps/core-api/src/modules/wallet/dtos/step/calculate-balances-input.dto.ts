import { z } from 'zod';

import { WalletSchema } from '../wallet/wallet.dto';

export const CalculateBalancesInputSchema = z.object({
  wallet: WalletSchema,

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' })
});

export type CalculateBalancesInputDto = z.infer<typeof CalculateBalancesInputSchema>;
