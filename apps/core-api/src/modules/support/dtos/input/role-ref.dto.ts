import { z } from 'zod';

export const RoleRefSchema = z.object({ role: z.string({ message: 'Role must be a string' }) });

export type RoleRefDto = z.infer<typeof RoleRefSchema>;
