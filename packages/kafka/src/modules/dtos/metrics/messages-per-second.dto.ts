import { z } from 'zod';

export const MessagesPerSecondSchema = z.object({
  currentTotalMessages: z.number({ message: 'Current total messages must be a number' })
});

export type MessagesPerSecondDto = z.infer<typeof MessagesPerSecondSchema>;
