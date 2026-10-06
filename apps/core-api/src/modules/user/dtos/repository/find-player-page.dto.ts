import { z } from 'zod';

export const FindPlayerPageSchema = z.object({
  limit: z.number().int().positive(),

  before: z.string().optional(),

  beforeId: z.string().optional()
});

export type FindPlayerPageDto = z.infer<typeof FindPlayerPageSchema>;
