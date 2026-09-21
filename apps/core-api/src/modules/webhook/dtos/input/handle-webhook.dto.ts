import { z } from 'zod';
import { RawBodyRequest } from '@common/libs';

import { HandleWebhookRequestSchema } from '../request/handle-webhook-request.dto';

export const HandleWebhookSchema = HandleWebhookRequestSchema.extend({
  req: z.custom<RawBodyRequest>()
});

export type HandleWebhookDto = z.infer<typeof HandleWebhookSchema>;
