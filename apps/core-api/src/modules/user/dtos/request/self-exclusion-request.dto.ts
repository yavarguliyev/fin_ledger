import { z } from 'zod';
import { SelfExclusionPeriod } from '@common/libs';

export const SelfExclusionRequestSchema = z.object({
  period: z.enum(SelfExclusionPeriod, { message: 'Period must be a valid self-exclusion period' })
});

export type SelfExclusionRequestDto = z.infer<typeof SelfExclusionRequestSchema>;
