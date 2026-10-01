import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { WebhookEventRecordSchema } from '../webhook-event/webhook-event.dto';

export const HandleClaimedEventSchema = z.object({
  event: WebhookEventRecordSchema,

  adapter: z.custom<DatabaseAdapter>()
});

export type HandleClaimedEventDto = z.infer<typeof HandleClaimedEventSchema>;
