import { z } from 'zod';

import { AnswerCallRequestSchema } from '../request/answer-call-request.dto';

export const AnswerCallSchema = AnswerCallRequestSchema.extend({
  callId: z.string({ message: 'Call ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  role: z.string({ message: 'Role must be a string' })
});

export type AnswerCallDto = z.infer<typeof AnswerCallSchema>;
