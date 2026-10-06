import { z } from 'zod';
import { LinkMetaSchema } from '@common/libs';

export const LinkPreviewResponseSchema = LinkMetaSchema.extend({
  url: z.string({ message: 'URL must be a string' })
});

export type LinkPreviewResponseDto = z.infer<typeof LinkPreviewResponseSchema>;
