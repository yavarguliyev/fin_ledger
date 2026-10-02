import { z } from 'zod';

export const ExceptionStatusSchema = z.object({ status: z.number({ message: 'Status must be a number' }).int() });

export type ExceptionStatusDto = z.infer<typeof ExceptionStatusSchema>;
