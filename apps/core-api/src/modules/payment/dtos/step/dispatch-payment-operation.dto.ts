import { z } from 'zod';

import { WalletSummarySchema } from '../../../wallet/dtos/wallet/wallet-summary.dto';
import { PaymentMethodSchema } from '../../../payment-methods/dtos/payment-method/payment-method.dto';
import { PaymentSchema } from '../payment/payment.dto';
import { ProcessPaymentSchema } from '../input/process-payment.dto';

export const DispatchPaymentOperationSchema = z.object({
  payment: PaymentSchema,

  dto: ProcessPaymentSchema,

  userWallet: WalletSummarySchema,

  method: PaymentMethodSchema
});

export type DispatchPaymentOperationDto = z.infer<typeof DispatchPaymentOperationSchema>;
