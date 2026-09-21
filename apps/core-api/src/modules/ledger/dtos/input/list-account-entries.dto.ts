import { z } from 'zod';
import { UserRoles } from '@common/libs';

import { ListAccountEntriesRequestSchema } from '../request/list-account-entries-request.dto';

export const ListAccountEntriesSchema = ListAccountEntriesRequestSchema.extend({
  role: z.enum(UserRoles, { message: 'Role must be a valid user role' }).optional()
});

export type ListAccountEntriesDto = z.infer<typeof ListAccountEntriesSchema>;
