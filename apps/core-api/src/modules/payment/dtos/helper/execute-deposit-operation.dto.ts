import { z } from 'zod';
import { CapableProvider, PaymentCapability } from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { CompletePaymentUseCase } from '../../use-cases/commands/complete-payment.use-case';
import { WalletService } from '../../../wallet/wallet.service';
import { WalletSummarySchema } from '../../../wallet/dtos/wallet/wallet-summary.dto';
import { PaymentMethodSchema } from '../../../payment-methods/dtos/payment-method/payment-method.dto';
import { PaymentSchema } from '../payment/payment.dto';
import { ProcessPaymentSchema } from '../input/process-payment.dto';

export const ExecuteDepositOperationSchema = z.object({
  payment: PaymentSchema,

  dto: ProcessPaymentSchema,

  userWallet: WalletSummarySchema,

  method: PaymentMethodSchema,

  provider: z.custom<CapableProvider<PaymentCapability.CHARGE>>(),

  walletService: z.custom<WalletService>(),

  paymentRepository: z.custom<PaymentRepository>(),

  completePayment: z.custom<CompletePaymentUseCase>()
});

export type ExecuteDepositOperationDto = z.infer<typeof ExecuteDepositOperationSchema>;
