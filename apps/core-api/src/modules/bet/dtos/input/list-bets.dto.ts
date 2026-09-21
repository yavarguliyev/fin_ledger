import { z } from 'zod';
import { UserRoles } from '@common/libs';

import { ListBetsRequestSchema } from '../request/list-bets-request.dto';

export const ListBetsSchema = ListBetsRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' }),

  role: z.enum(UserRoles, { message: 'Role must be a valid user role' }).optional()
});

export type ListBetsDto = z.infer<typeof ListBetsSchema>;
