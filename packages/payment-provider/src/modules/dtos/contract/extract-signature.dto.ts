import { z } from 'zod';
import { ProviderHeaders } from '@common/shared-libs';

export const ExtractSignatureSchema = z.object({
  headers: z.custom<ProviderHeaders>()
});

export type ExtractSignatureDto = z.infer<typeof ExtractSignatureSchema>;
