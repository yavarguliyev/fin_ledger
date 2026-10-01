import { z } from 'zod';

export const OriginRefSchema = z.object({ origin: z.string({ message: 'Origin must be a string' }) });

export type OriginRefDto = z.infer<typeof OriginRefSchema>;
