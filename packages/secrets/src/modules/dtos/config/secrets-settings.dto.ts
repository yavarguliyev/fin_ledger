import { z } from 'zod';

import { AwsConnectionSchema } from './aws-connection.dto';

export const SecretsSettingsSchema = AwsConnectionSchema.extend({
  secretId: z.string({ message: 'Secret ID must be a string' })
});

export type SecretsSettingsDto = z.infer<typeof SecretsSettingsSchema>;
