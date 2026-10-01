import { z } from 'zod';

export const SaveCredentialSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  credentialId: z.string({ message: 'Credential ID must be a string' }),

  publicKey: z.string({ message: 'Public key must be a string' }),

  signCount: z.number({ message: 'Sign count must be a number' }),

  transports: z.array(z.string({ message: 'Each transport must be a string' })),

  backedUp: z.boolean({ message: 'Backed up must be a boolean' }),

  deviceLabel: z.string({ message: 'Device label must be a string' }).optional()
});

export type SaveCredentialDto = z.infer<typeof SaveCredentialSchema>;
