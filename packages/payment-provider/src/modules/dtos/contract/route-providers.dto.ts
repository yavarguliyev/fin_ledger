import { z } from 'zod';
import { PaymentCapability, PaymentProvider } from '@common/shared-libs';

export const RouteProvidersSchema = z.object({
  capability: z.enum(PaymentCapability, { message: 'Capability must be a valid payment capability' }),

  currency: z.string({ message: 'Currency must be a string' }).optional(),

  country: z.string({ message: 'Country must be a string' }).optional(),

  exclude: z.array(z.enum(PaymentProvider), { message: 'Exclude must be an array of providers' }).optional()
});

export type RouteProvidersDto = z.infer<typeof RouteProvidersSchema>;
