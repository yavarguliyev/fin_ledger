import { z } from 'zod';

import { SUPPORT } from '../../constants/chat/support.constant';

export const ListMessagesRequestSchema = z.object({
  id: z.string({ message: 'ID must be a string' }).min(1, { message: 'ID is required' }),

  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .int({ message: 'Limit must be an integer' })
    .positive({ message: 'Limit must be positive' })
    .max(SUPPORT.PAGE_SIZE_MAX, { message: 'Limit is too large' })
    .optional(),

  before: z.string({ message: 'Before must be a string' }).optional()
});

export type ListMessagesRequestDto = z.infer<typeof ListMessagesRequestSchema>;
