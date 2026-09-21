import { z } from 'zod';

import { CreateSetupSessionRequestSchema } from '../request/create-setup-session-request.dto';

export const CreateSetupSessionSchema = CreateSetupSessionRequestSchema.extend({
  email: z.string({ message: 'Email must be a string' }).optional()
});

export type CreateSetupSessionDto = z.infer<typeof CreateSetupSessionSchema>;
