import { z } from 'zod';

import { ProcessRole } from '../../enums/common/process-role.enum';

export const BackgroundWorkerOptionsSchema = z.object({
  role: z.enum(ProcessRole, { message: 'Role must be a valid ProcessRole' })
});

export type BackgroundWorkerOptionsDto = z.infer<typeof BackgroundWorkerOptionsSchema>;
