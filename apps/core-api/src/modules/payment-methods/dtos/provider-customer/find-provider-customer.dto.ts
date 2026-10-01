import { z } from 'zod';
import { PaymentProvider } from '@common/libs';

export const FindProviderCustomerSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  provider: z.enum(PaymentProvider, { message: 'Provider must be a valid payment provider' })
});

export type FindProviderCustomerDto = z.infer<typeof FindProviderCustomerSchema>;
