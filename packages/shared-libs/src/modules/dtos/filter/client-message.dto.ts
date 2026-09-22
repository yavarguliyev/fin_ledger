import { z } from 'zod';

export const ClientMessageSchema = z.object({
  status: z.number().int(),

  message: z.string()
});

export type ClientMessageDto = z.infer<typeof ClientMessageSchema>;
