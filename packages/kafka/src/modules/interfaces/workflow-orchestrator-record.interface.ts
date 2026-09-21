import { WorkflowContext } from '@common/shared-libs';

import { WorkflowStep } from './workflow-step.interface';

export interface WorkflowOrchestratorRecord<TContext extends WorkflowContext> {
  readonly workflowName: string;
  readonly steps: WorkflowStep<TContext>[];
}
