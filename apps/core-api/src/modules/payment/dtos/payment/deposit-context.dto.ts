import { z } from 'zod';

import { PaymentDto } from './payment.dto';
import { RequestPaymentDto } from '../request/request-payment.dto';

export const DepositContextSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  dto: z.custom<RequestPaymentDto>(),

  walletId: z.string({ message: 'Wallet ID must be a string' }).optional(),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }).optional(),

  paymentId: z.string({ message: 'Payment ID must be a string' }).optional(),

  payment: z.custom<PaymentDto>().optional()
});

export const DepositWorkflowInputSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  dto: z.custom<RequestPaymentDto>()
});

export type DepositContextDto = z.infer<typeof DepositContextSchema>;

export type DepositWorkflowInput = z.infer<typeof DepositWorkflowInputSchema>;
