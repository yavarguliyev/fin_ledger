import { z } from 'zod';
import { DatabaseAdapter, OutboxRepository, PaymentType, RequestContext, UnknownRecord } from '@common/libs';

import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';
import { PaymentRepository } from '../../repositories/payment.repository';
import { WalletService } from '../../../wallet/wallet.service';
import { WalletSummaryDto } from '../../../wallet/dtos/wallet/wallet-summary.dto';

export const RequestPaymentSchema = z.object({
  amountMinor: z
    .number({ message: 'Amount must be an integer (minor units)' })
    .int({ message: 'Amount must be an integer (minor units)' })
    .min(1, { message: 'Amount must be greater than 0' }),

  currency: z
    .string({ message: 'Currency must be a string' })
    .min(1, { message: 'Currency is required' })
    .length(3, { message: 'Currency must be a 3-character ISO code' }),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }).min(1, { message: 'Idempotency key is required' }),

  paymentMethodId: z.string({ message: 'Payment method ID must be a string' }).uuid({ message: 'Payment method ID must be a valid UUID' }).optional(),

  metadata: z.record(z.string(), z.unknown(), { message: 'Metadata must be a record' }).optional() as z.ZodType<UnknownRecord>
});

export type RequestPaymentDto = z.infer<typeof RequestPaymentSchema>;

export type RequestPayment = { context: RequestContext; dto: RequestPaymentDto };

export type RequestPaymentInput = { userId: string; dto: RequestPaymentDto; paymentMethodRepository: PaymentMethodRepository };

export type ProcessPaymentInput = {
  userId: string;
  paymentType: PaymentType;
  dto: RequestPaymentDto;
  tx: DatabaseAdapter;
  paymentMethodRepository: PaymentMethodRepository;
  paymentRepository: PaymentRepository;
  walletService: WalletService;
  outboxRepository: OutboxRepository;
  validateWallet: (wallet: WalletSummaryDto, dto: RequestPaymentDto) => void;
};

export type ExecuteWalletOperationInput = {
  walletService: WalletService;
  walletId: string;
  amountMinor: number;
  currency: string;
  paymentId: string;
  paymentType: PaymentType;
  tx: DatabaseAdapter;
};

export type CreateHandleOptionsInput = {
  paymentId: string;
  userId: string;
  walletId: string;
  input: RequestPaymentDto;
  tx: DatabaseAdapter;
};
