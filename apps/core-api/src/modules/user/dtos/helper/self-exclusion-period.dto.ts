import { z } from 'zod';
import { SelfExclusionPeriod } from '@common/libs';

export const SelfExclusionPeriodSchema = z.object({ period: z.enum(SelfExclusionPeriod) });

export type SelfExclusionPeriodDto = z.infer<typeof SelfExclusionPeriodSchema>;
