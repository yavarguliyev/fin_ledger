import { z } from 'zod';
import { SimulatedResultSchema } from './simulated-result.dto';
import { OperationResultDto } from './operation-result.dto';

export const ExecuteOperationSchema = SimulatedResultSchema.extend({
  operation: z.custom<() => Promise<string | OperationResultDto>>()
});

export type ExecuteOperationDto = z.infer<typeof ExecuteOperationSchema>;
