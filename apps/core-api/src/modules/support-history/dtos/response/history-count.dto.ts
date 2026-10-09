import { z } from 'zod';

export const HistoryCountSchema = z.object({
  count: z.number({ message: 'Count must be a number' })
});

export type HistoryCountDto = z.infer<typeof HistoryCountSchema>;
