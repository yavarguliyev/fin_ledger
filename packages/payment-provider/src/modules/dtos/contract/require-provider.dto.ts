import { z } from 'zod';
import { PaymentCapability } from '@common/shared-libs';

import { ProviderNameSchema } from './provider-name.dto';

export const RequireProviderSchema = ProviderNameSchema.extend({
  capability: z.enum(PaymentCapability, { message: 'Invalid payment capability' })
});

export type RequireProviderDto = z.infer<typeof RequireProviderSchema>;
