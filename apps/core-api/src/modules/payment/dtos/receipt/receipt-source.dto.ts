import { z } from 'zod';

import { PaymentSchema } from '../payment/payment.dto';

export const ReceiptSourceSchema = z.object({
  payment: PaymentSchema,

  customerName: z.string({ message: 'Customer name must be a string' }),

  cardBrand: z.string({ message: 'Card brand must be a string' }).nullable(),

  lastFour: z.string({ message: 'Last four must be a string' }).nullable()
});

export type ReceiptSourceDto = z.infer<typeof ReceiptSourceSchema>;
