import { z } from 'zod';

export const PaymentMethodStatusV1Schema = z.object({
  paymentMethodId: z.string({ message: 'Payment method ID must be a string' }).min(1),

  userId: z.string({ message: 'User ID must be a string' }).min(1),

  provider: z.string({ message: 'Provider must be a string' }).min(1),

  providerMethodId: z.string({ message: 'Provider method ID must be a string' }).min(1),

  status: z.string({ message: 'Status must be a string' }).min(1)
});

export type PaymentMethodStatusV1 = z.infer<typeof PaymentMethodStatusV1Schema>;
