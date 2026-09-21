import { z } from 'zod';
import { Logger } from '@nestjs/common';

import { AdapterCredentialsSchema } from '../adapter/adapter-credentials.dto';

export const RequireCredentialsSchema = AdapterCredentialsSchema.extend({
  providerName: z.string({ message: 'Provider name must be a string' }),

  logger: z.custom<Logger>().optional()
});

export type RequireCredentialsDto = z.infer<typeof RequireCredentialsSchema>;
