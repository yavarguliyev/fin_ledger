import { z } from 'zod';

import { WalletSchema } from '../wallet/wallet.dto';
import { AnalyticsEventPayloadSchema } from '../../../analytics/dtos/analytics-event.dto';

export const WalletTransactionResultSchema = z.object({
  wallet: WalletSchema,

  eventPayload: AnalyticsEventPayloadSchema.extend({
    transactionId: z.string({ message: 'Transaction ID must be a string' })
  })
});

export type WalletTransactionResultDto = z.infer<typeof WalletTransactionResultSchema>;
