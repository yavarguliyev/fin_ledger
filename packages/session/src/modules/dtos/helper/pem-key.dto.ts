import { z } from 'zod';

export const PemKeySchema = z.object({ key: z.string({ message: 'Key must be a string' }) });

export type PemKeyDto = z.infer<typeof PemKeySchema>;
