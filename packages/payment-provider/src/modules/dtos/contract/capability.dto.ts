import { z } from 'zod';
import { PaymentCapability } from '@common/shared-libs';

export const CapabilitySchema = z.object({
  capability: z.enum(PaymentCapability, { message: 'Invalid payment capability' })
});

export type CapabilityDto = z.infer<typeof CapabilitySchema>;
