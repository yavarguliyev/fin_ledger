import { z } from 'zod';
import { PaymentMethodType } from '@common/libs';

export const CreatePaymentMethodSchema = z.object({
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

  isDefault: z.boolean().optional()
});

export type CreatePaymentMethodDto = z.infer<typeof CreatePaymentMethodSchema>;
export type CreatePaymentMethod = CreatePaymentMethodDto & { userId: string };
