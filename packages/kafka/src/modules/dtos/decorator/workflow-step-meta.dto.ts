import { z } from 'zod';

export const WorkflowStepMetaSchema = z.object({
  stepName: z.string({ message: 'Step name must be a string' })
});

export type WorkflowStepMetaDto = z.infer<typeof WorkflowStepMetaSchema>;
