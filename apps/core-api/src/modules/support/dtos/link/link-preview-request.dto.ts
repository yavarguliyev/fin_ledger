import { z } from 'zod';

import { LINK_PREVIEW } from '../../constants/link/link-preview.constant';

export const LinkPreviewRequestSchema = z.object({
  url: z.url({ message: 'URL must be a valid link' }).max(LINK_PREVIEW.URL_MAX, { message: 'URL is too long' })
});

export type LinkPreviewRequestDto = z.infer<typeof LinkPreviewRequestSchema>;
