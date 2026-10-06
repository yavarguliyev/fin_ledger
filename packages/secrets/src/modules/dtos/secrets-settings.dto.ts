import { z } from 'zod';

export const SecretsSettingsSchema = z.object({
  secretId: z.string({ message: 'Secret ID must be a string' }),

  region: z.string({ message: 'Region must be a string' }),

  endpoint: z.string({ message: 'Endpoint must be a string' }).optional(),

  accessKeyId: z.string({ message: 'Access key ID must be a string' }).optional(),

  secretAccessKey: z.string({ message: 'Secret access key must be a string' }).optional()
});

export type SecretsSettingsDto = z.infer<typeof SecretsSettingsSchema>;
