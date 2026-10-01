import { z } from 'zod';

import { UserCredentialSchema } from './user-credential.dto';

export const CredentialListSchema = z.object({ credentials: z.array(UserCredentialSchema) });

export type CredentialListDto = z.infer<typeof CredentialListSchema>;
