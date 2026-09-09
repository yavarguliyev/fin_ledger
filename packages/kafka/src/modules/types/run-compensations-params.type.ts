import { Logger } from '@nestjs/common';
import { WorkflowContext } from '@common/shared-libs';

import { WorkflowStep } from '../interfaces/workflow.interface';

export type RunCompensationsParams<TContext extends WorkflowContext> = {
  steps: WorkflowStep<TContext>[];
  context: TContext;
  failedIndex: number;
  logger: Logger;
};
