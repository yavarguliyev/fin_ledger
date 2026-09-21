import { z } from 'zod';

import { AggregateQuerySchema } from './aggregate-query.dto';

export const AggregateExpressionSchema = AggregateQuerySchema.extend({
  aggregateExpr: z.string({ message: 'Aggregate expression must be a string' })
});

export type AggregateExpressionDto = z.infer<typeof AggregateExpressionSchema>;
