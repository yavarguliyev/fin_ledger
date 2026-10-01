import { z } from 'zod';

export const FindChargeByMetadataSchema = z.object({
  key: z.string({ message: 'Metadata key must be a string' }).regex(/^\w+$/, { message: 'Metadata key must be alphanumeric' }),

  value: z.string({ message: 'Metadata value must be a string' }).regex(/^[\w-]+$/, { message: 'Metadata value must be alphanumeric' })
});

export type FindChargeByMetadataDto = z.infer<typeof FindChargeByMetadataSchema>;
