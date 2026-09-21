import { WORKFLOW_STEP_METADATA } from '@common/shared-libs';

import { WorkflowStepMetaDto } from '../dtos/decorator/workflow-step-meta.dto';

export const WorkflowStepMeta = ({ stepName }: WorkflowStepMetaDto): ClassDecorator => {
  return (target: object): void => Reflect.defineMetadata(WORKFLOW_STEP_METADATA, stepName, target);
};
