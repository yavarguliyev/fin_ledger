import { z } from 'zod';

import { FindProviderCustomerSchema } from './find-provider-customer.dto';

export const RememberProviderCustomerSchema = FindProviderCustomerSchema.extend({
  providerCustomerId: z.string({ message: 'Provider customer ID must be a string' })
});

export type RememberProviderCustomerDto = z.infer<typeof RememberProviderCustomerSchema>;
