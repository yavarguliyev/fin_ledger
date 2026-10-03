import { z } from 'zod';

export const PublicKeySchema = z.object({ publicKey: z.string({ message: 'Public key must be a string' }) });

export type PublicKeyDto = z.infer<typeof PublicKeySchema>;
