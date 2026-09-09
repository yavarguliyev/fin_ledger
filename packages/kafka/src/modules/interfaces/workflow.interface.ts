import { WorkflowContext, WorkflowExecutionRecord, WorkflowSteps } from '@common/shared-libs';

export interface WorkflowStep<TContext extends WorkflowContext> {
  readonly stepName: WorkflowSteps;
  execute(context: TContext): Promise<void>;
  compensate(context: TContext): Promise<void>;
}

export interface WorkflowOrchestratorRecord<TContext extends WorkflowContext> {
  readonly workflowName: string;
  readonly steps: WorkflowStep<TContext>[];
}

export interface WorkflowRunRecord<TContext extends WorkflowContext> {
  readonly context: TContext;
  readonly executionLog: WorkflowExecutionRecord[];
}
