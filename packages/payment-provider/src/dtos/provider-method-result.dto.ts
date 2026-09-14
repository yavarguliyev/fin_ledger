import { z } from 'zod';
import { CardBrand, DigitalWalletType, PaymentMethodStatus } from '@common/shared-libs';

export const ProviderMethodResultSchema = z.object({
  paymentMethodToken: z.string({ message: 'Payment method token must be a string' }),

  status: z.enum(PaymentMethodStatus),

  brand: z.enum(CardBrand).optional(),

  last4: z.string().optional(),

  walletType: z.enum(DigitalWalletType).optional(),

  rawResponse: z.record(z.string(), z.unknown()).optional(),

  failureReason: z.string().optional()
});

export type ProviderMethodResultDto = z.infer<typeof ProviderMethodResultSchema>;
