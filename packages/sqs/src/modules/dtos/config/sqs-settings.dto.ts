import { z } from 'zod';

import { SqsConnectionSchema } from './sqs-connection.dto';

export const SqsSettingsSchema = SqsConnectionSchema.extend({
  topicArn: z.string({ message: 'Topic ARN must be a string' }),

  queuePrefix: z.string({ message: 'Queue prefix must be a string' })
});

export type SqsSettingsDto = z.infer<typeof SqsSettingsSchema>;
