import { z } from 'zod';

import { PaymentRepository } from '../../repositories/payment.repository';
import { WalletService } from '../../../wallet/wallet.service';

export const FailWithdrawalSchema = z.object({
  walletService: z.custom<WalletService>(),

  paymentRepository: z.custom<PaymentRepository>(),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int(),

  paymentId: z.string({ message: 'Payment ID must be a string' }),

  reason: z.string({ message: 'Reason must be a string' })
});

export type FailWithdrawalDto = z.infer<typeof FailWithdrawalSchema>;
