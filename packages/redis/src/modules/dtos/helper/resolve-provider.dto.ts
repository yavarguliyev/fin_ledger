import { z } from 'zod';

export const ResolveProviderSchema = z.object({
  target: z.custom<Record<string | symbol, unknown>>()
});

export type ResolveProviderDto = z.infer<typeof ResolveProviderSchema>;
