import { z } from 'zod';

export const TextBodySchema = z.object({ value: z.unknown() });

export type TextBodyDto = z.infer<typeof TextBodySchema>;
