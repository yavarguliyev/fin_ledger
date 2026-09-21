import { z } from 'zod';
import { CardBrand, DigitalWalletType, PaymentMethodStatus, PaymentMethodType, PaymentProvider } from '@common/libs';

export const PaymentMethodSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  type: z.enum(PaymentMethodType, { message: 'Invalid payment method type' }),

  accountHolder: z.string({ message: 'Account holder must be a string' }),

  lastFour: z.string({ message: 'Last four must be a string' }).optional().nullable(),

  bankName: z.string({ message: 'Bank name must be a string' }).optional().nullable(),

  provider: z.enum(PaymentProvider, { message: 'Invalid payment provider' }),

  providerMethodId: z.string({ message: 'Provider method ID must be a string' }).optional().nullable(),

  cardBrand: z.enum(CardBrand, { message: 'Invalid card brand' }).optional().nullable(),

  walletType: z.enum(DigitalWalletType, { message: 'Invalid digital wallet type' }).optional().nullable(),

  expiryMonth: z.number({ message: 'Expiry month must be a number' }).optional().nullable(),

  expiryYear: z.number({ message: 'Expiry year must be a number' }).optional().nullable(),

  fingerprint: z.string({ message: 'Fingerprint must be a string' }).optional().nullable(),

  verifiedAt: z.date({ message: 'Verified at must be a valid date' }).optional().nullable(),

  deletedAt: z.date({ message: 'Deleted at must be a valid date' }).optional().nullable(),

  failureReason: z.string({ message: 'Failure reason must be a string' }).optional().nullable(),

  status: z.enum(PaymentMethodStatus, { message: 'Invalid payment method status' }),

  isDefault: z.boolean({ message: 'isDefault must be a boolean' }),

  metadata: z.record(z.string(), z.unknown(), { message: 'Metadata must be an object' }).optional().nullable(),

  createdAt: z.date({ message: 'Created at must be a valid date' }),

  updatedAt: z.date({ message: 'Updated at must be a valid date' })
});

export type PaymentMethodDto = z.infer<typeof PaymentMethodSchema>;
