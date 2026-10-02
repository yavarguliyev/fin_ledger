import { z } from 'zod';

export const PresenceScopeSchema = z.object({ staffOnly: z.boolean({ message: 'Staff only must be a boolean' }) });

export type PresenceScopeDto = z.infer<typeof PresenceScopeSchema>;
