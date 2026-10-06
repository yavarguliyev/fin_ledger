import { z } from 'zod';

export const HtmlMetaInputSchema = z.object({
  html: z.string({ message: 'HTML must be a string' }),

  url: z.string({ message: 'URL must be a string' })
});

export type HtmlMetaInputDto = z.infer<typeof HtmlMetaInputSchema>;
