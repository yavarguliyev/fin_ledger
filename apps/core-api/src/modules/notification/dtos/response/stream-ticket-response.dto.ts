import { z } from 'zod';

export const StreamTicketResponseSchema = z.object({ ticket: z.string({ message: 'Ticket must be a string' }) });

export type StreamTicketResponseDto = z.infer<typeof StreamTicketResponseSchema>;
