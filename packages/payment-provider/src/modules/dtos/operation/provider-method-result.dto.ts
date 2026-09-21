import { z } from 'zod';
import { CardBrand, DigitalWalletType, PaymentMethodStatus, PaymentMethodType } from '@common/shared-libs';

export const ProviderMethodResultSchema = z.object({
  paymentMethodToken: z.string({ message: 'Payment method token must be a string' }),

  status: z.enum(PaymentMethodStatus),

  methodType: z.enum(PaymentMethodType).optional(),

  brand: z.enum(CardBrand).optional(),

  last4: z.string().optional(),

  expMonth: z.number().int().min(1).max(12).optional(),

  expYear: z.number().int().min(2000).max(2100).optional(),

  fingerprint: z.string().optional(),

  billingName: z.string().optional(),

  walletType: z.enum(DigitalWalletType).optional(),

  rawResponse: z.record(z.string(), z.unknown()).optional(),

  failureReason: z.string().optional()
});

export type ProviderMethodResultDto = z.infer<typeof ProviderMethodResultSchema>;
