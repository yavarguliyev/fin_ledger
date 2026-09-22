import { z } from 'zod';

import { OperationResultSchema } from '../adapter/operation-result.dto';

export const OperationResultRefSchema = z.object({
  result: OperationResultSchema
});

export type OperationResultRefDto = z.infer<typeof OperationResultRefSchema>;
