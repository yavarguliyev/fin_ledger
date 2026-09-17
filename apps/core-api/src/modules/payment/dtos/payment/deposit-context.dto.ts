import { z } from 'zod';

import { PaymentDto } from './payment.dto';
import { RequestPaymentDto } from '../request/request-payment.dto';
import { PaymentProvider } from '@common/libs';

export const DepositContextSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  dto: z.custom<RequestPaymentDto>(),

  walletId: z.string({ message: 'Wallet ID must be a string' }).optional(),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }).optional(),

  paymentId: z.string({ message: 'Payment ID must be a string' }).optional(),

  provider: z.enum(PaymentProvider, { message: 'Invalid payment provider' }).optional(),

  providerMethodId: z.string({ message: 'Provider method ID must be a string' }).optional(),

  providerChargeId: z.string({ message: 'Provider charge ID must be a string' }).optional(),

  payment: z.custom<PaymentDto>().optional()
});

export type DepositContextDto = z.infer<typeof DepositContextSchema>;

export const DepositWorkflowInputSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  dto: z.custom<RequestPaymentDto>()
});

export type DepositWorkflowInput = z.infer<typeof DepositWorkflowInputSchema>;
