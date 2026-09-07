import { z } from 'zod';
import { PaymentMethodStatus, PaymentMethodType } from '@common/libs';

export const PaymentMethodSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  type: z.enum(PaymentMethodType, { message: 'Invalid payment method type' }),

  accountHolder: z.string({ message: 'Account holder must be a string' }),

  maskedAccount: z.string({ message: 'Masked account must be a string' }),

  bankName: z.string({ message: 'Bank name must be a string' }).optional().nullable(),

  status: z.enum(PaymentMethodStatus, { message: 'Invalid payment method status' }),

  isDefault: z.boolean({ message: 'isDefault must be a boolean' }),

  metadata: z.record(z.string(), z.unknown(), { message: 'Metadata must be an object' }).optional().nullable(),

  createdAt: z.date({ message: 'Created at must be a valid date' }),

  updatedAt: z.date({ message: 'Updated at must be a valid date' })
});

export type PaymentMethodDto = z.infer<typeof PaymentMethodSchema>;
