import { z } from 'zod';
import { PaymentProvider } from '@common/libs';

export const ProviderCustomerSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  provider: z.enum(PaymentProvider, { message: 'Provider must be a valid payment provider' }),

  providerCustomerId: z.string({ message: 'Provider customer ID must be a string' }),

  createdAt: z.string({ message: 'Created at must be a string' }),

  updatedAt: z.string({ message: 'Updated at must be a string' })
});

export type ProviderCustomerDto = z.infer<typeof ProviderCustomerSchema>;
