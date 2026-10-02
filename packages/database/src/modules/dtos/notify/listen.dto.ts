import { z } from 'zod';

export const ListenSchema = z.object({
  channel: z.string({ message: 'Channel must be a string' }),

  onNotify: z.custom<() => void>()
});

export type ListenDto = z.infer<typeof ListenSchema>;
