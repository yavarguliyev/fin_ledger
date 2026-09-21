import { z } from 'zod';
import { OrderDirection, UnknownRecord, WhereCondition } from '@common/shared-libs';

export const QueryOptionsSchema = z.object({
  orderBy: z.string().optional(),

  page: z.number().int().optional(),

  limit: z.number().int().optional(),

  offset: z.number().int().optional(),

  orderDirection: z.custom<OrderDirection>().optional(),

  searchFields: z.array(z.string()).optional(),

  where: z.custom<UnknownRecord | WhereCondition[]>().optional(),

  search: z.object({ fields: z.array(z.string()), term: z.string() }).optional()
});

export type QueryOptionsDto = z.infer<typeof QueryOptionsSchema>;
