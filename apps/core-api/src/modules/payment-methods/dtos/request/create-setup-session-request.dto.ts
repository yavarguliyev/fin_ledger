import { z } from 'zod';
import { PaymentProvider } from '@common/libs';

export const CreateSetupSessionRequestSchema = z.object({
  provider: z.enum(PaymentProvider, { message: 'Invalid payment provider' }),

  returnUrl: z.url({ message: 'returnUrl must be a valid URL' })
});

export type CreateSetupSessionRequestDto = z.infer<typeof CreateSetupSessionRequestSchema>;
