import { z } from 'zod';

export const CredentialIdSchema = z.object({ credentialId: z.string({ message: 'Credential ID must be a string' }) });

export type CredentialIdDto = z.infer<typeof CredentialIdSchema>;
