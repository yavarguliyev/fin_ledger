import { z } from 'zod';

export interface EventContract {
  version: number;
  schema: z.ZodType;
}
