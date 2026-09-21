import { z } from 'zod';

export const ExceptionRefSchema = z.object({
  exception: z.unknown()
});

export type ExceptionRefDto = z.infer<typeof ExceptionRefSchema>;
