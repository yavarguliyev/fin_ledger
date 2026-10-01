import { z } from 'zod';

export const TaskPayloadSchema = z.object({ payload: z.record(z.string(), z.unknown()) });

export type TaskPayloadDto = z.infer<typeof TaskPayloadSchema>;
