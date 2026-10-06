import { z } from 'zod';

import { LinkPreviewResponseSchema } from './link-preview-response.dto';

export const SaveLinkPreviewSchema = z.object({
  preview: LinkPreviewResponseSchema
});

export type SaveLinkPreviewDto = z.infer<typeof SaveLinkPreviewSchema>;
