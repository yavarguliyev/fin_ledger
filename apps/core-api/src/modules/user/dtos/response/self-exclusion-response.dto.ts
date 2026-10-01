import { z } from 'zod';

export const SelfExclusionResponseSchema = z.object({
  status: z.boolean({ message: 'Status must be a boolean' }),

  message: z.string({ message: 'Message must be a string' }),

  selfExclusionUntil: z.iso.datetime({ message: 'Self exclusion until must be a valid ISO datetime' })
});

export type SelfExclusionResponseDto = z.infer<typeof SelfExclusionResponseSchema>;
