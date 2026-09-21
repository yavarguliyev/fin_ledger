import { z } from 'zod';
import { ProviderHeaders } from '@common/shared-libs';

export const HeaderValueSchema = z.object({
  headers: z.custom<ProviderHeaders>(),

  name: z.string({ message: 'Header name must be a string' })
});

export type HeaderValueDto = z.infer<typeof HeaderValueSchema>;
