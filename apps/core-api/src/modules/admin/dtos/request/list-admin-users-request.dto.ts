import { z } from 'zod';

import { ADMIN_USERS } from '../../constants/users/admin-users.constant';

export const ListAdminUsersRequestSchema = z
  .object({
    limit: z.coerce.number({ message: 'Limit must be a number' }).int().positive().max(ADMIN_USERS.MAX_LIMIT).default(ADMIN_USERS.DEFAULT_LIMIT),

    before: z.iso.datetime({ offset: true, message: 'Before must be an ISO date-time' }).optional(),

    beforeId: z.uuid({ message: 'Before ID must be a UUID' }).optional()
  })
  .refine(({ before, beforeId }) => !before === !beforeId, { message: ADMIN_USERS.CURSOR_MESSAGE });

export type ListAdminUsersRequestDto = z.infer<typeof ListAdminUsersRequestSchema>;
