import { WorkflowContext, WorkflowExecutionRecord, WorkflowStepStatus } from '@common/shared-libs';

import { RunCompensationsParams } from '../types/run-compensations-params.type';

export const runCompensations = async <TContext extends WorkflowContext>(
  params: RunCompensationsParams<TContext>
): Promise<WorkflowExecutionRecord[]> => {
  const { steps, context, failedIndex, logger } = params;

  const log: WorkflowExecutionRecord[] = [];
  const executedSteps = steps.slice(0, failedIndex).reverse();

  for (const currentStep of executedSteps) {
    try {
      await currentStep.compensate(context);
      log.push({ stepName: currentStep.stepName, status: WorkflowStepStatus.COMPENSATED });
      logger.warn(`Compensated: ${currentStep.stepName}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.push({ stepName: currentStep.stepName, status: WorkflowStepStatus.FAILED });
      logger.error(`Compensation failed for ${currentStep.stepName}: ${msg}`);
    }
  }

  return log;
};
