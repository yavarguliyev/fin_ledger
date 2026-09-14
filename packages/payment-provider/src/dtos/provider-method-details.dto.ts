import { z } from 'zod';
import { DigitalWalletType, PaymentMethodType } from '@common/shared-libs';

export const ProviderMethodDetailsSchema = z.object({
  type: z.enum(PaymentMethodType),

  walletType: z.enum(DigitalWalletType).optional(),

  token: z.string().optional(),

  cardNumber: z.string().optional(),

  expMonth: z.number().int().min(1).max(12).optional(),

  expYear: z.number().int().min(2024).optional(),

  expiryMonth: z.number().int().min(1).max(12).optional(),

  expiryYear: z.number().int().min(2024).optional(),

  cvc: z.string().optional(),

  cvv: z.string().optional(),

  holderName: z.string().optional(),

  walletToken: z.string().optional(),

  billingDetails: z.record(z.string(), z.unknown()).optional()
});

export type ProviderMethodDetailsDto = z.infer<typeof ProviderMethodDetailsSchema>;
