import { z } from 'zod';
import { PaymentProvider, RequestContext } from '@common/libs';

export const CreateSetupSessionSchema = z.object({ returnUrl: z.string().url({ message: 'returnUrl must be a valid URL' }) });

export type CreateSetupSessionDto = z.infer<typeof CreateSetupSessionSchema> & {
  req: RequestContext;
  provider: PaymentProvider;
};

export const ConfirmSetupSessionSchema = z.object({ sessionId: z.string().min(1, { message: 'sessionId is required' }) });

export type ConfirmSetupSessionDto = z.infer<typeof ConfirmSetupSessionSchema> & {
  req: RequestContext;
  provider: PaymentProvider;
};
