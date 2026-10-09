import { z } from 'zod';
import { ProviderHeaders } from '@common/libs';

import { HandleWebhookRequestSchema } from '../request/handle-webhook-request.dto';

export const HandleWebhookSchema = HandleWebhookRequestSchema.extend({
  rawPayload: z.custom<Buffer | string>(),

  headers: z.custom<ProviderHeaders>()
});

export type HandleWebhookDto = z.infer<typeof HandleWebhookSchema>;
