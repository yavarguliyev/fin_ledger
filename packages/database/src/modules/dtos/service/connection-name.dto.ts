import { z } from 'zod';

export const ConnectionNameSchema = z.object({
  name: z.string().optional()
});

export type ConnectionNameDto = z.infer<typeof ConnectionNameSchema>;
