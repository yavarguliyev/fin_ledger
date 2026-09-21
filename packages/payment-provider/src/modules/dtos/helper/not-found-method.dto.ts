import { z } from 'zod';
import { PaymentProvider } from '@common/shared-libs';

export const NotFoundMethodSchema = z.object({
  token: z.string({ message: 'Token must be a string' }),

  provider: z.enum(PaymentProvider, { message: 'Invalid payment provider' })
});

export type NotFoundMethodDto = z.infer<typeof NotFoundMethodSchema>;
