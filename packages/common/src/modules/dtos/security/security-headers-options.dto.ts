import { z } from 'zod';

export const SecurityHeadersOptionsSchema = z.object({ docsPath: z.string({ message: 'Docs path must be a string' }) });

export type SecurityHeadersOptionsDto = z.infer<typeof SecurityHeadersOptionsSchema>;
