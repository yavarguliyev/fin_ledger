import { z } from 'zod';

export const SqsSettingsSchema = z.object({
  region: z.string({ message: 'Region must be a string' }),

  topicArn: z.string({ message: 'Topic ARN must be a string' }),

  queuePrefix: z.string({ message: 'Queue prefix must be a string' }),

  endpoint: z.string({ message: 'Endpoint must be a string' }).optional(),

  accessKeyId: z.string({ message: 'Access key ID must be a string' }).optional(),

  secretAccessKey: z.string({ message: 'Secret access key must be a string' }).optional()
});

export type SqsSettingsDto = z.infer<typeof SqsSettingsSchema>;
