import { z } from 'zod';

export const StreamTicketSchema = z.object({
  ticket: z.string({ message: 'Ticket must be a string' }).min(1, { message: 'Ticket is required' })
});

export type StreamTicketDto = z.infer<typeof StreamTicketSchema>;
