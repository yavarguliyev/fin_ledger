import { Injectable, Logger } from '@nestjs/common';
import { errorResponse, WorkflowContext, WorkflowExecutionRecord, WorkflowNames, WorkflowStepStatus } from '@common/shared-libs';

import { WorkflowStep, WorkflowRunRecord } from '../interfaces/workflow.interface';
import { runCompensations } from '../helpers/run-compensations-params.helper';

@Injectable()
export abstract class WorkflowOrchestratorService<TInput, TContext extends WorkflowContext> {
  protected abstract readonly workflowName: WorkflowNames;
  private readonly logger: Logger;

  constructor () {
    this.logger = new Logger(this.getWorkflowName());
  }

  protected abstract buildContext(input: TInput): TContext;
  protected abstract getSteps(): WorkflowStep<TContext>[];

  async execute (input: TInput): Promise<WorkflowRunRecord<TContext>> {
    const context = this.buildContext(input);
    const steps = this.getSteps();
    const executionLog: WorkflowExecutionRecord[] = [];

    for (const step of steps) {
      try {
        await step.execute(context);
        executionLog.push({ stepName: step.stepName, status: WorkflowStepStatus.COMPLETED });
        this.logger.log(`[${step.stepName}] Step completed`);
      } catch (err) {
        executionLog.push({ stepName: step.stepName, status: WorkflowStepStatus.FAILED });

        this.logger.error(`[${step.stepName}] Step failed: ${errorResponse(err).message}`);
        const stepIndex = steps.indexOf(step);
        const compensationLog = await runCompensations({ steps, context, failedIndex: stepIndex, logger: this.logger });

        return { context, executionLog: [...executionLog, ...compensationLog] };
      }
    }

    return { context, executionLog };
  }

  protected getWorkflowName (): string {
    return this.workflowName;
  }
}
