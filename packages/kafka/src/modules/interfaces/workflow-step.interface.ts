import { WorkflowContext, WorkflowSteps } from '@common/shared-libs';

export interface WorkflowStep<TContext extends WorkflowContext> {
  readonly stepName: WorkflowSteps;
  execute(context: TContext): Promise<void>;
  compensate(context: TContext): Promise<void>;
}
