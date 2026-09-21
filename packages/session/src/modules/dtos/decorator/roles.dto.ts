import { z } from 'zod';
import { UserRoles } from '@common/shared-libs';

export const RolesSchema = z.object({
  roles: z.array(z.enum(UserRoles, { message: 'Invalid role' }))
});

export type RolesDto = z.infer<typeof RolesSchema>;
