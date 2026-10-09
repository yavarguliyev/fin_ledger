import { z } from 'zod';

import { AwsConnectionSchema } from './aws-connection.dto';

export const ParametersSettingsSchema = AwsConnectionSchema.extend({
  path: z.string({ message: 'Parameter path must be a string' })
});

export type ParametersSettingsDto = z.infer<typeof ParametersSettingsSchema>;
