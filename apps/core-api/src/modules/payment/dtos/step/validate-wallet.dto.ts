import { z } from 'zod';

import { WalletSummarySchema } from '../../../wallet/dtos/wallet/wallet-summary.dto';
import { ProcessPaymentSchema } from '../input/process-payment.dto';

export const ValidateWalletSchema = z.object({
  wallet: WalletSummarySchema,

  dto: ProcessPaymentSchema
});

export type ValidateWalletDto = z.infer<typeof ValidateWalletSchema>;
