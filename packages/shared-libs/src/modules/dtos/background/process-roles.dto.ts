import { z } from 'zod';

import { BACKGROUND_WORKER } from '../../constants/lifecycle/background-worker.constant';
import { ProcessRole } from '../../enums/common/process-role.enum';

export const ProcessRolesSchema = z
  .string({ message: 'PROCESS_ROLES must be a string' })
  .default(BACKGROUND_WORKER.DEFAULT_ROLES)
  .transform(value =>
    value
      .split(BACKGROUND_WORKER.SEPARATOR)
      .map(role => role.trim())
      .filter(role => role.length > 0)
  )
  .pipe(z.array(z.enum(ProcessRole, { message: 'PROCESS_ROLES must list valid ProcessRole values' })).min(1, { message: 'PROCESS_ROLES needs a role' }));

export type ProcessRolesDto = z.infer<typeof ProcessRolesSchema>;
