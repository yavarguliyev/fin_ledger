import { z } from 'zod';

export const InstanceWrapperSchema = z.object({
  instance: z.unknown().optional()
});

export type InstanceWrapperDto = z.infer<typeof InstanceWrapperSchema>;
