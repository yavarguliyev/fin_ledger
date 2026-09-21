import { z } from 'zod';
import { Logger } from '@nestjs/common';
import { WorkflowContext } from '@common/shared-libs';

import { WorkflowStep } from '../../interfaces/workflow-step.interface';

export const RunCompensationsSchema = z.object({
  steps: z.custom<WorkflowStep<WorkflowContext>[]>(),

  context: z.custom<WorkflowContext>(),

  failedIndex: z.number({ message: 'Failed index must be a number' }).int(),

  logger: z.custom<Logger>()
});

export type RunCompensationsDto = z.infer<typeof RunCompensationsSchema>;
