import { z } from 'zod';

export const OkResponseSchema = z.object({ ok: z.boolean({ message: 'Ok must be a boolean' }) });

export type OkResponseDto = z.infer<typeof OkResponseSchema>;
