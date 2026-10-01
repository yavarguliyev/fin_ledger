import { z } from 'zod';

import { CreateSetupSessionRequestSchema } from '../request/create-setup-session-request.dto';

export const CreateSetupSessionSchema = CreateSetupSessionRequestSchema.extend({
  email: z.string({ message: 'Email must be a string' }).optional(),

  userId: z.string({ message: 'User ID must be a string' })
});

export type CreateSetupSessionDto = z.infer<typeof CreateSetupSessionSchema>;
