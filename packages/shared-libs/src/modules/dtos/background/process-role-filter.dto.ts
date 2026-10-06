import { z } from 'zod';

import { ProcessRole } from '../../enums/common/process-role.enum';

export const ProcessRoleFilterSchema = z.object({
  roles: z.array(z.enum(ProcessRole))
});

export type ProcessRoleFilterDto = z.infer<typeof ProcessRoleFilterSchema>;
