import { z } from 'zod';
import { EntityData } from '@common/shared-libs';

export const InsertQuerySchema = <T, K extends keyof T = keyof T>(): z.ZodObject<{ data: z.ZodCustom<EntityData>; returningColumns: z.ZodOptional<z.ZodCustom<K[]>> }> =>
  z.object({
    data: z.custom<EntityData>(),

    returningColumns: z.custom<K[]>().optional()
  });

export type InsertQueryDto<T, K extends keyof T = keyof T> = z.infer<ReturnType<typeof InsertQuerySchema<T, K>>>;
