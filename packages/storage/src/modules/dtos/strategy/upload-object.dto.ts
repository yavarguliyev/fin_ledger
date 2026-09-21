import { z } from 'zod';

export const UploadObjectSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  body: z.custom<Buffer | Uint8Array | string>(),

  contentType: z.string({ message: 'Content type must be a string' }).optional()
});

export type UploadObjectDto = z.infer<typeof UploadObjectSchema>;
