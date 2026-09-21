import { z } from 'zod';
import { PaymentProvider } from '@common/libs';

import { WalletSummarySchema } from '../../../wallet/dtos/wallet/wallet-summary.dto';
import { ProcessPaymentSchema } from '../input/process-payment.dto';

export const CreatePaymentRecordSchema = z.object({
  wallet: WalletSummarySchema,

  dto: ProcessPaymentSchema,

  provider: z.enum(PaymentProvider, { message: 'Invalid payment provider' })
});

export type CreatePaymentRecordDto = z.infer<typeof CreatePaymentRecordSchema>;
