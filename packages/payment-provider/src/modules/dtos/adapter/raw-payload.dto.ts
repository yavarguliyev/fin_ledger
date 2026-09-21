import { z } from 'zod';

export const RawPayloadSchema = z.object({
  payload: z.custom<Buffer | string>()
});

export type RawPayloadDto = z.infer<typeof RawPayloadSchema>;
