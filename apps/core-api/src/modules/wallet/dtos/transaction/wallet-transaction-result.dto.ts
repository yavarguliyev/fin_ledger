import { z } from 'zod';

import { WalletSchema } from '../wallet/wallet.dto';
import { AnalyticsEventPayloadSchema } from '../../../analytics';

export const WalletTransactionResultSchema = z.object({
  wallet: WalletSchema,

  ledgerTransactionId: z.string({ message: 'Ledger transaction ID must be a string' }),

  eventPayload: AnalyticsEventPayloadSchema
});

export type WalletTransactionResultDto = z.infer<typeof WalletTransactionResultSchema>;
