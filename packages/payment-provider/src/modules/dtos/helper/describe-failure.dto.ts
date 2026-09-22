import { z } from 'zod';
import { ProviderError } from '@common/shared-libs';

export const DescribeFailureSchema = z.object({
  failure: z.custom<ProviderError>()
});

export type DescribeFailureDto = z.infer<typeof DescribeFailureSchema>;
