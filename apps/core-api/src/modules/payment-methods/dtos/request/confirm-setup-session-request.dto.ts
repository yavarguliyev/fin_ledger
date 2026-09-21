import { z } from 'zod';
import { PaymentProvider } from '@common/libs';

export const ConfirmSetupSessionRequestSchema = z.object({
  provider: z.enum(PaymentProvider, { message: 'Invalid payment provider' }),

  sessionId: z.string({ message: 'sessionId must be a string' }).min(1, { message: 'sessionId is required' })
});

export type ConfirmSetupSessionRequestDto = z.infer<typeof ConfirmSetupSessionRequestSchema>;
