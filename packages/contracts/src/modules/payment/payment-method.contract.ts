import { z } from 'zod';

import {
  CARD_BRANDS,
  DIGITAL_WALLET_TYPES,
  PAYMENT_METHOD_STATUSES,
  PAYMENT_METHOD_TYPES,
  PAYMENT_PROVIDERS
} from './payment-method-values.contract';

export const PaymentMethodContractSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  type: z.enum(PAYMENT_METHOD_TYPES, { message: 'Invalid payment method type' }),

  accountHolder: z.string({ message: 'Account holder must be a string' }),

  lastFour: z.string({ message: 'Last four must be a string' }).nullable(),

  bankName: z.string({ message: 'Bank name must be a string' }).nullable(),

  provider: z.enum(PAYMENT_PROVIDERS, { message: 'Invalid payment provider' }),

  cardBrand: z.enum(CARD_BRANDS, { message: 'Invalid card brand' }).nullable(),

  walletType: z.enum(DIGITAL_WALLET_TYPES, { message: 'Invalid digital wallet type' }).nullable(),

  expiryMonth: z.number({ message: 'Expiry month must be a number' }).nullable(),

  expiryYear: z.number({ message: 'Expiry year must be a number' }).nullable(),

  status: z.enum(PAYMENT_METHOD_STATUSES, { message: 'Invalid payment method status' }),

  isDefault: z.boolean({ message: 'isDefault must be a boolean' }),

  metadata: z.record(z.string(), z.unknown(), { message: 'Metadata must be an object' }).nullable()
});

export type PaymentMethodContract = z.infer<typeof PaymentMethodContractSchema>;
