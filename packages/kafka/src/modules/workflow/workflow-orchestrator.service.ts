import { Logger } from '@nestjs/common';
import { BaseHelper, WorkflowContext, WorkflowExecutionRecord, WorkflowNames, WorkflowStepStatus } from '@common/shared-libs';

import { WorkflowStep } from '../interfaces/workflow-step.interface';
import { WorkflowRunRecord } from '../interfaces/workflow-run-record.interface';
import { KafkaHelper } from '../helpers/kafka.helper';

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
      } catch (error) {
        executionLog.push({ stepName: step.stepName, status: WorkflowStepStatus.FAILED });

        this.logger.error(`[${step.stepName}] Step failed: ${BaseHelper.errorResponse({ error }).message}`);
        const stepIndex = steps.indexOf(step);
        const compensationLog = await KafkaHelper.runCompensations({ steps, context, failedIndex: stepIndex, logger: this.logger });

        return { context, executionLog: [...executionLog, ...compensationLog] };
      }
    }

    return { context, executionLog };
  }

  protected getWorkflowName (): string {
    return this.workflowName;
  }
}
