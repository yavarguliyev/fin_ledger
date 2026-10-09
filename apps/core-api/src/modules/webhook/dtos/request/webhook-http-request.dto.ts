import { z } from 'zod';
import { RawBodyRequest } from '@common/libs';

import { HandleWebhookRequestSchema } from './handle-webhook-request.dto';

export const WebhookHttpRequestSchema = HandleWebhookRequestSchema.extend({ req: z.custom<RawBodyRequest>() });

export type WebhookHttpRequestDto = z.infer<typeof WebhookHttpRequestSchema>;
