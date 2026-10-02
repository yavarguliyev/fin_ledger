import { z } from 'zod';

export const AlertMessageSchema = z.object({
  title: z.string(),
  content: z.string()
});

export type AlertMessageDto = z.infer<typeof AlertMessageSchema>;
