import { z } from 'zod';
import { EmailTemplateType } from '@common/libs';

import { PublishUserEmailSchema } from './publish-user-email.dto';

export const RecordEmailEventSchema = PublishUserEmailSchema.extend({
  eventType: z.enum(EmailTemplateType, { message: 'Event type must be a valid EmailTemplateType enum' })
});

export type RecordEmailEventDto = z.infer<typeof RecordEmailEventSchema>;
