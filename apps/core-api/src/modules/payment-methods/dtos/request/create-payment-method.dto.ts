import { z } from 'zod';
import { CardBrand, DigitalWalletType, PaymentMethodType, PaymentProvider, validateLuhn } from '@common/libs';

export const CreatePaymentMethodSchema = z
  .object({
    type: z.enum(PaymentMethodType, { message: 'Invalid payment method type' }),

    accountHolder: z
      .string({ message: 'Account holder must be a string' })
      .min(2, { message: 'Account holder must have at least 2 characters' })
      .max(100, { message: 'Account holder cannot exceed 100 characters' }),

    accountNumber: z
      .string({ message: 'Account number is required' })
      .min(4, { message: 'Account number must be at least 4 digits/characters' })
      .max(34, { message: 'Account number cannot exceed 34 characters' }),

    bankName: z.string({ message: 'Bank name must be a string' }).max(100, { message: 'Bank name cannot exceed 100 characters' }).optional(),

    provider: z.enum(PaymentProvider, { message: 'Invalid payment provider' }).optional(),

    walletType: z.enum(DigitalWalletType, { message: 'Invalid digital wallet type' }).optional(),

    walletToken: z.string().optional(),

    expiryMonth: z.number().int().min(1).max(12).optional(),

    expiryYear: z.number().int().min(2024).max(2099).optional(),

    cvv: z.string().regex(/^\d{3,4}$/, { message: 'CVV must be 3 or 4 digits' }).optional(),

    isDefault: z.boolean().optional()
  })
  .refine(
    data => {
      if (data.type === PaymentMethodType.CREDIT_CARD || data.type === PaymentMethodType.DEBIT_CARD) {
        const sanitized = data.accountNumber.replace(/[\s-]/g, '');
        if (/^\d{13,19}$/.test(sanitized)) {
          return validateLuhn(sanitized);
        }
      }

      return true;
    },
    { message: 'Invalid card number checksum (Luhn algorithm failed)', path: ['accountNumber'] }
  );

export type CreatePaymentMethodDto = z.infer<typeof CreatePaymentMethodSchema>;

export type CreatePaymentMethod = CreatePaymentMethodDto & {
  userId: string;
  cardBrand?: CardBrand;
  providerMethodId?: string;
};
