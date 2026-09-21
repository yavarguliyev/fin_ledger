import { WorkflowContext, WorkflowExecutionRecord } from '@common/shared-libs';

export interface WorkflowRunRecord<TContext extends WorkflowContext> {
  readonly context: TContext;
  readonly executionLog: WorkflowExecutionRecord[];
}
