import { z } from 'zod';

export const DeletedMessagesResponseSchema = z.object({
  deleted: z.number({ message: 'Deleted must be a number' }),

  failed: z.number({ message: 'Failed must be a number' })
});

export type DeletedMessagesResponseDto = z.infer<typeof DeletedMessagesResponseSchema>;
