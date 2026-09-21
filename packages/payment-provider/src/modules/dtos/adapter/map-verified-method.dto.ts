import { z } from 'zod';
import { CardBrand, DigitalWalletType, PaymentMethodType } from '@common/shared-libs';

export const MapVerifiedMethodSchema = z.object({
  token: z.string({ message: 'Token must be a string' }),

  brand: z.enum(CardBrand, { message: 'Invalid card brand' }),

  methodType: z.enum(PaymentMethodType).optional(),

  last4: z.string().optional(),

  expMonth: z.number().int().optional(),

  expYear: z.number().int().optional(),

  fingerprint: z.string().optional(),

  billingName: z.string().optional(),

  walletType: z.enum(DigitalWalletType, { message: 'Invalid digital wallet type' }).optional(),

  rawResponse: z.record(z.string(), z.unknown()).optional()
});

export type MapVerifiedMethodDto = z.infer<typeof MapVerifiedMethodSchema>;
