import { WORKFLOW_STEP_METADATA } from '@common/shared-libs';

export const WorkflowStepMeta = (stepName: string): ClassDecorator => {
  return (target: object): void => Reflect.defineMetadata(WORKFLOW_STEP_METADATA, stepName, target);
};
