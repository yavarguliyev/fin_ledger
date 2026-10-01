import { z } from 'zod';

export const UserCredentialSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  credentialId: z.string({ message: 'Credential ID must be a string' }),

  publicKey: z.string({ message: 'Public key must be a string' }),

  signCount: z.number({ message: 'Sign count must be a number' }),

  transports: z.array(z.string({ message: 'Each transport must be a string' })),

  deviceLabel: z.string({ message: 'Device label must be a string' }).nullable(),

  backedUp: z.boolean({ message: 'Backed up must be a boolean' }),

  lastUsedAt: z.string({ message: 'Last used at must be a string' }).nullable(),

  createdAt: z.string({ message: 'Created at must be a string' }),

  updatedAt: z.string({ message: 'Updated at must be a string' })
});

export type UserCredentialDto = z.infer<typeof UserCredentialSchema>;
